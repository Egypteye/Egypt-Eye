/**
 * Measuring the things this business actually earns from.
 *
 * =========================================================================
 * WHY THIS DID NOT EXIST, AND WHAT IT COST
 * =========================================================================
 * GA4 went in on 1 November 2026 with page views and nothing else. On
 * 25 November the owner asked why conversions had dropped, and the answer was
 * that not one form, button or WhatsApp link on this site had ever sent GA4
 * an event. "Qualified leads: 0" and "Converted leads: 0" every day for
 * twenty-four days were not a decline — GA4 had never been given anything to
 * count, so the reports were empty by construction.
 *
 * The site's dominant conversion route makes this worse than it sounds. A
 * tour page offers six ways to make contact and three of them are WhatsApp,
 * which leaves no email and, until this file, no record of any kind. A
 * customer could read three pages, tap "Book on WhatsApp" and close the tab,
 * and nothing anywhere would know it happened.
 *
 * =========================================================================
 * generate_lead, NOT A CUSTOM NAME
 * =========================================================================
 * GA4 treats `generate_lead` as a recommended event, which means it can be
 * marked a key event in the UI without custom definitions and is understood
 * by Ads and the standard lead reports. A bespoke name would work but would
 * leave the owner building definitions by hand in a console they do not use.
 * `lead_source` carries which surface produced it.
 *
 * =========================================================================
 * WHAT MUST NEVER BE PASSED
 * =========================================================================
 * No name, email address, phone number, message body or any other field a
 * visitor typed about themselves. Google's terms forbid carrying it, an
 * account found doing so can be purged, and these are precisely the forms
 * that collect it. Parameters describe the SURFACE, never the person, and
 * scripts/check-lead-tracking.mts fails the build if a caller passes one of
 * the known field names.
 */

import { trackEvent } from "./track";

/**
 * Every surface that can produce a lead, named once.
 *
 * A registry rather than free strings at each call site: the whole point is
 * to compare surfaces against each other, and that only works if "enquiry
 * modal" is spelled the same way in all of them. The check script asserts
 * every caller uses a value from here.
 */
export const LEAD_SOURCES = {
  tourEnquiry: "tour_enquiry_modal",
  campaignEnquiry: "campaign_enquiry",
  customize: "customize_trip",
  transfer: "transfer_booking",
  shopVisit: "shop_visit",
  hotelRate: "hotel_rate_request",
  treasureRequest: "boutique_request",
  collaborate: "collaborate_application",
  travelAgent: "travel_agent_application",
  affiliate: "affiliate_application",
  tripSeat: "weekly_trip_seat",
  secureBooking: "secure_booking",
  newsletter: "newsletter_signup",
  concierge: "concierge",
  review: "review_submission",
  cartouche: "cartouche_order",
} as const;

export type LeadSource = (typeof LEAD_SOURCES)[keyof typeof LEAD_SOURCES];

/**
 * One confirmed lead.
 *
 * Call this only AFTER the server has accepted the submission. An event sent
 * on click rather than on success counts abandoned and rejected attempts as
 * conversions, which is the most common way a funnel ends up reporting
 * numbers nobody can reconcile with the inbox.
 */
export function trackLead(source: LeadSource, subject?: string): void {
  trackEvent("generate_lead", {
    lead_source: source,
    // The product or page, when there is one. A slug or title — never a
    // field the visitor typed about themselves.
    item_name: subject ? subject.slice(0, 100) : undefined,
  });
}

/**
 * A tap on WhatsApp, email or phone.
 *
 * Separate from `generate_lead` on purpose: we cannot know whether the
 * conversation actually happened, only that the visitor left for it. Counting
 * it as a confirmed lead would inflate the funnel against the one surface
 * that produces no verifiable record.
 */
export function trackOutboundContact(channel: "whatsapp" | "email" | "phone", from?: string): void {
  trackEvent("contact_click", {
    contact_channel: channel,
    // The page path the click happened on, so the report can say which pages
    // drive contact. Never a query string, which can carry typed input.
    page_path: from ? from.split("?")[0].slice(0, 120) : undefined,
  });
}
