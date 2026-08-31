import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveReservation } from "@/lib/myEgypt";
import { buildConciergeSystemPrompt } from "@/lib/concierge/systemPrompt";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/env";
import { checkRateLimit } from "@/lib/rateLimit";

// "Ask Egypt Eye" — a Gemini-backed concierge that requires a real session
// and only ever sees the logged-in customer's own reservation (fetched
// server-side by their user id, never trusted from the client). Every
// question and answer is logged to concierge_requests for staff visibility.

const MODEL = "gemini-3.6-flash";
const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 1000;
const REQUEST_MARKER = /\[\[REQUEST:\s*([\s\S]+?)\]\]\s*$/;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to use the concierge." }, { status: 401 });

  const reservation = await getActiveReservation(user.id);
  if (!reservation) {
    return NextResponse.json({ error: "The concierge unlocks once you have a confirmed reservation." }, { status: 403 });
  }

  const { allowed } = await checkRateLimit({ bucket: "concierge", key: user.id, max: 40, windowSeconds: 3600 });
  if (!allowed) {
    return NextResponse.json({ error: "You've reached the hourly limit for the concierge — please try again soon." }, { status: 429 });
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) return NextResponse.json({ error: "No message provided" }, { status: 400 });
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: "Conversation too long — please start a new chat" }, { status: 400 });
  }
  for (const m of messages) {
    if (typeof m.content !== "string" || m.content.length === 0 || m.content.length > MAX_MESSAGE_LENGTH || (m.role !== "user" && m.role !== "assistant")) {
      return NextResponse.json({ error: "Invalid message in conversation" }, { status: 400 });
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The concierge isn't configured on this deployment yet." }, { status: 500 });
  }

  const systemInstruction = buildConciergeSystemPrompt({ firstName: user.firstName, reservation });
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1500 },
      }),
    });
  } catch (err) {
    console.error("Concierge Gemini request failed:", err);
    return NextResponse.json({ error: "Couldn't reach the concierge. Please try again." }, { status: 502 });
  }

  if (!res.ok) {
    const errText = await res.text();
    console.error("Concierge Gemini API error:", res.status, errText);
    return NextResponse.json({ error: "Couldn't reach the concierge. Please try again." }, { status: 502 });
  }

  const data = await res.json();
  const rawReply: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawReply) {
    return NextResponse.json({ error: "Couldn't get a response. Please try again." }, { status: 502 });
  }

  const requestMatch = rawReply.match(REQUEST_MARKER);
  const reply = rawReply.replace(REQUEST_MARKER, "").trim();
  const suggestedRequest = requestMatch ? requestMatch[1].trim() : null;

  if (supabaseAdminConfigured) {
    const supabase = createAdminSupabaseClient();
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    await supabase.from("concierge_requests").insert({
      customer_id: user.id,
      reservation_id: reservation.id,
      question: lastUserMessage?.content ?? "",
      answer: reply,
      requires_staff: Boolean(suggestedRequest),
      staff_status: suggestedRequest ? "pending" : "none",
    });
  }

  return NextResponse.json({ reply, suggestedRequest });
}
