"use client";

import { useState } from "react";
import {
  COLLABORATION_NO_PROMISE,
  collaborationCategories,
  collaborationModels,
} from "@/content/flyingDressCollaborations";
import { contact, whatsappHref, flyingDressEnquiry } from "@/content/flyingDresses";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * The collaboration proposal form.
 *
 * ONE FORM, CONDITIONAL QUESTIONS. The brief asked for a different experience
 * per collaborator type, and the tempting reading of that is six forms. Six
 * forms is six things to keep in step and five chances to land on the wrong
 * one. Instead the category picks which extra question appears, because that
 * is the only part that genuinely differs: a brand is asked for deliverables
 * and budget, a venue is asked what they provide and where, a creator is
 * asked for links.
 *
 * SUCCESS IS NEVER CLAIMED EARLY. `status` only becomes "sent" after the API
 * returns ok, and the API only returns ok after the team email actually sent.
 * A proposal that silently failed, with a cheerful thank-you on screen, is the
 * worst outcome available here: the sender believes they are waiting on us.
 */
export function CollaborateForm({ initialCategory = "" }: { initialCategory?: string }) {
  const [category, setCategory] = useState(initialCategory);
  const [model, setModel] = useState("");
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [links, setLinks] = useState("");
  const [proposal, setProposal] = useState("");
  const [offering, setOffering] = useState("");
  const [timeline, setTimeline] = useState("");
  const [budget, setBudget] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const chosen = collaborationCategories.find((c) => c.id === category);

  // Which extra question this kind of partner should actually be asked.
  const wantsLinks = category === "creators" || category === "music" || category === "production";
  const wantsBudget = category === "brands" || category === "production";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please tell us your name.");
    if (!email.trim()) return setError("Please give us an email address.");
    if (!proposal.trim()) return setError("Please tell us what you are proposing.");

    setStatus("sending");
    try {
      const response = await fetch("/api/flying-dresses-collaborate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          model,
          name,
          organisation,
          email,
          whatsapp,
          country,
          website,
          links,
          proposal,
          offering,
          timeline,
          budget,
          company,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || "We could not send that just now.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("We could not send that just now.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="fd-form" role="status">
        <h3 className="fd-display fd-h3">Your proposal is with us</h3>
        <p className="fd-muted" style={{ marginTop: "1rem" }}>
          We have emailed you a copy. {COLLABORATION_NO_PROMISE}
        </p>
      </div>
    );
  }

  return (
    <form className="fd-form" onSubmit={onSubmit} noValidate>
      <div className="fd-field">
        <label htmlFor="fdc-category">What kind of collaboration is this?</label>
        <select
          id="fdc-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Choose one</option>
          {collaborationCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {chosen ? (
          <p className="fd-note" style={{ marginTop: "0.5rem" }}>
            {chosen.shape}
          </p>
        ) : null}
      </div>

      <div className="fd-field">
        <label htmlFor="fdc-model">What are you proposing?</label>
        <select id="fdc-model" value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="">Choose one</option>
          {collaborationModels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="fd-form-2">
        <div className="fd-field">
          <label htmlFor="fdc-name">Your name</label>
          <input id="fdc-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="fd-field">
          <label htmlFor="fdc-org">Company, brand or artist name</label>
          <input
            id="fdc-org"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        </div>
      </div>

      <div className="fd-form-2">
        <div className="fd-field">
          <label htmlFor="fdc-email">Email</label>
          <input
            id="fdc-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="fd-field">
          <label htmlFor="fdc-whatsapp">WhatsApp, with country code</label>
          <input
            id="fdc-whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+20 ..."
          />
        </div>
      </div>

      <div className="fd-form-2">
        <div className="fd-field">
          <label htmlFor="fdc-country">Where are you based?</label>
          <input id="fdc-country" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className="fd-field">
          <label htmlFor="fdc-website">Website</label>
          <input id="fdc-website" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
      </div>

      {wantsLinks ? (
        <div className="fd-field">
          <label htmlFor="fdc-links">Where can we see your work?</label>
          <textarea
            id="fdc-links"
            rows={2}
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            placeholder="Instagram, a portfolio, a mix, a showreel"
          />
        </div>
      ) : null}

      <div className="fd-field">
        <label htmlFor="fdc-proposal">
          {chosen ? chosen.prompt : "What are you proposing?"}
        </label>
        <textarea
          id="fdc-proposal"
          rows={5}
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          required
        />
      </div>

      <div className="fd-field">
        <label htmlFor="fdc-offering">What would you bring to it?</label>
        <textarea
          id="fdc-offering"
          rows={3}
          value={offering}
          onChange={(e) => setOffering(e.target.value)}
        />
      </div>

      <div className="fd-form-2">
        <div className="fd-field">
          <label htmlFor="fdc-timeline">Timing or dates</label>
          <input id="fdc-timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)} />
        </div>
        {wantsBudget ? (
          <div className="fd-field">
            <label htmlFor="fdc-budget">Budget or how you would structure it</label>
            <input id="fdc-budget" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
        ) : null}
      </div>

      {/* Off-screen rather than display:none — some bots fill positioned
          fields and skip hidden ones, which is the point of it. */}
      <div className="fd-honeypot" aria-hidden="true">
        <label htmlFor="fdc-company">Company</label>
        <input
          id="fdc-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <p className="fd-note">{COLLABORATION_NO_PROMISE}</p>

      {error ? (
        <div className="fd-form-status" data-tone="error" role="alert" tabIndex={-1}>
          {error}
        </div>
      ) : null}

      <div className="fd-actions">
        <button className="fd-btn" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send your proposal"}
        </button>
        <a
          className="fd-btn fd-btn-ghost"
          href={whatsappHref(flyingDressEnquiry({ subject: "a collaboration" }))}
          target="_blank"
          rel="noopener noreferrer"
        >
          Or message us
          <span className="fd-sr"> on WhatsApp (opens in a new tab)</span>
        </a>
      </div>

      <p className="fd-note" style={{ marginTop: "1rem" }}>
        Prefer email? {contact.email}
      </p>
    </form>
  );
}
