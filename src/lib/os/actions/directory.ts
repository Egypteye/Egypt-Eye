"use server";

import { revalidatePath } from "next/cache";
import { osdb, getOrg } from "../db";
import { record } from "../audit";
import { guarded } from "./guard";
import { ok, fail, type ActionResult } from "../action-types";

// ---------------------------------------------------------------------------
// THE OPERATIONAL DIRECTORY — RESOURCES, SUPPLIERS, LOCATIONS, PEOPLE
// ---------------------------------------------------------------------------
// The four things a trip is assembled from, and the four records that had no
// way of being created from inside the OS. Every one of them is behind its own
// permission, so an operations executive can register a vehicle without being
// able to add a member of staff.
//
// Two rules run through all of them:
//
//   * References are allocated here, from the highest existing one, and are
//     never typed by a human. Two people registering a van at the same moment
//     get VEH-07 and VEH-08, and the unique (org_id, code) constraint is what
//     makes that a refusal rather than a duplicate if they truly collide.
//
//   * Creating a person creates an EMPLOYEE RECORD, not a login. Freelance
//     crew are scheduled for years without ever having an account, and linking
//     an account is a separate, separately-permissioned act under Admin.
// ---------------------------------------------------------------------------

const RESOURCE_PREFIX: Record<string, string> = {
  vehicle: "VEH",
  dress: "DR",
  equipment: "EQ",
  venue: "VN",
  prop: "PROP",
  other: "RES",
};

/** The next free code in a series, read from the highest one already used. */
async function nextCode(table: string, orgId: string, prefix: string, pad: number): Promise<string> {
  const { data } = await osdb()
    .from(table)
    .select("code")
    .eq("org_id", orgId)
    .like("code", `${prefix}-%`)
    .order("code", { ascending: false })
    .limit(1)
    .maybeSingle();
  const used = data?.code ? Number(String(data.code).slice(prefix.length + 1).replace(/\D/g, "")) : 0;
  return `${prefix}-${String(used + 1).padStart(pad, "0")}`;
}

// ---------------------------------------------------------------------------
// RESOURCES
// ---------------------------------------------------------------------------

export async function createResource(input: {
  kind: "vehicle" | "dress" | "equipment" | "venue" | "prop" | "other";
  name: string;
  description?: string | null;
  unitId?: string | null;
  status?: string | null;
  condition?: string | null;
  capacity?: number | null;
  model?: string | null;
  plate?: string | null;
  year?: number | null;
  color?: string | null;
  size?: string | null;
  serialNumber?: string | null;
  homeBase?: string | null;
  costRateAmount?: number | null;
  costRateCurrency?: string | null;
  costRateUnit?: string | null;
  insuranceExpiresOn?: string | null;
  licenseExpiresOn?: string | null;
  notes?: string | null;
}): Promise<ActionResult<{ id: string; code: string }>> {
  return guarded("resources.create", async (actor) => {
    const name = input.name.trim();
    if (!name) return fail("The resource needs a name");
    if (!RESOURCE_PREFIX[input.kind]) return fail("Choose what kind of resource this is");

    const db = osdb();
    const org = await getOrg();
    const code = await nextCode("os_resources", org.id, RESOURCE_PREFIX[input.kind], 2);

    // A cost rate with no currency would be added to a trip as a bare number
    // and silently treated as base currency. Refuse rather than assume.
    if (input.costRateAmount != null && input.costRateAmount > 0 && !input.costRateCurrency) {
      return fail("A cost rate needs a currency", "Pick the currency this resource is paid for in.");
    }

    const { data: created, error } = await db.from("os_resources").insert({
      org_id: org.id,
      kind: input.kind,
      code,
      name,
      description: input.description?.trim() || null,
      unit_id: input.unitId || null,
      status: input.status || "available",
      condition: input.condition || "good",
      capacity: input.capacity ?? null,
      model: input.model?.trim() || null,
      plate: input.plate?.trim() || null,
      year: input.year ?? null,
      color: input.color?.trim() || null,
      size: input.size?.trim() || null,
      serial_number: input.serialNumber?.trim() || null,
      home_base: input.homeBase?.trim() || null,
      cost_rate_amount: input.costRateAmount ?? null,
      cost_rate_currency: input.costRateCurrency || "USD",
      cost_rate_unit: input.costRateUnit || "per_trip",
      insurance_expires_on: input.insuranceExpiresOn || null,
      license_expires_on: input.licenseExpiresOn || null,
      notes: input.notes?.trim() || null,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      {
        entityType: "resource",
        entityId: created.id as string,
        verb: "created",
        summary: `${name} registered as ${code}.`,
        meta: { kind: input.kind },
      },
      { action: "resource.create", entityLabel: `${code} — ${name}`, after: { ...input, code } },
    );

    revalidatePath("/os/resources");
    return ok({ id: created.id as string, code }, `${name} registered as ${code}.`);
  });
}

// ---------------------------------------------------------------------------
// SUPPLIERS
// ---------------------------------------------------------------------------

export async function createSupplier(input: {
  name: string;
  legalName?: string | null;
  contactName?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  country?: string | null;
  city?: string | null;
  categories?: string[];
  paymentTerms?: string | null;
  currency?: string | null;
  contractReference?: string | null;
  contractExpiresOn?: string | null;
  rating?: number | null;
  notes?: string | null;
}): Promise<ActionResult<{ id: string; code: string }>> {
  return guarded("suppliers.create", async (actor) => {
    const name = input.name.trim();
    if (!name) return fail("The supplier needs a name");

    const db = osdb();
    const org = await getOrg();

    // Two records for the same partner means two spend histories and two
    // performance scores, which is the same problem duplicate clients cause.
    const { data: existing } = await db
      .from("os_suppliers")
      .select("id, code, name")
      .eq("org_id", org.id)
      .is("archived_at", null)
      .ilike("name", name)
      .limit(1);
    if (existing?.length) {
      return fail(
        `${existing[0].name} is already registered as ${existing[0].code}`,
        "Open that record and edit it rather than creating a second one — spend and incident history follow the record.",
      );
    }

    if (input.rating != null && (input.rating < 1 || input.rating > 5)) {
      return fail("A rating is out of 5", "Leave it blank until there is something to base it on.");
    }

    const code = await nextCode("os_suppliers", org.id, "SUP", 2);

    const { data: created, error } = await db.from("os_suppliers").insert({
      org_id: org.id,
      code,
      name,
      legal_name: input.legalName?.trim() || null,
      contact_name: input.contactName?.trim() || null,
      phone: input.phone?.trim() || null,
      whatsapp: input.whatsapp?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      website: input.website?.trim() || null,
      country: input.country?.trim() || "Egypt",
      city: input.city?.trim() || null,
      categories: input.categories ?? [],
      payment_terms: input.paymentTerms?.trim() || null,
      currency: input.currency || "EGP",
      contract_reference: input.contractReference?.trim() || null,
      contract_expires_on: input.contractExpiresOn || null,
      rating: input.rating ?? null,
      notes: input.notes?.trim() || null,
      created_by: actor.employeeId,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      { entityType: "supplier", entityId: created.id as string, verb: "created", summary: `${name} registered as ${code}.` },
      { action: "supplier.create", entityLabel: `${code} — ${name}`, after: { ...input, code } },
    );

    revalidatePath("/os/suppliers");
    return ok({ id: created.id as string, code }, `${name} registered as ${code}.`);
  });
}

// ---------------------------------------------------------------------------
// LOCATIONS
// ---------------------------------------------------------------------------
// A location is not an address. It is where the operational knowledge lives —
// where the van can park, which gate the permit covers, how long the drive
// really takes at 6am — and it is what stops that knowledge being a single
// point of failure in one veteran's head.

export async function createLocation(input: {
  name: string;
  kind?: string | null;
  city?: string | null;
  region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  typicalDriveMinutes?: number | null;
  accessNotes?: string | null;
  permitNotes?: string | null;
  ticketNotes?: string | null;
  bestTimeNotes?: string | null;
  notes?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  return guarded("admin.catalog", async (actor) => {
    const name = input.name.trim();
    if (!name) return fail("The location needs a name");

    const db = osdb();
    const org = await getOrg();

    const { data: existing } = await db
      .from("os_locations")
      .select("id, name")
      .eq("org_id", org.id)
      .ilike("name", name)
      .limit(1);
    if (existing?.length) {
      return fail(`${existing[0].name} is already in the location list`, "Edit that one so the notes stay in a single place.");
    }

    const { data: created, error } = await db.from("os_locations").insert({
      org_id: org.id,
      name,
      kind: input.kind || "site",
      city: input.city?.trim() || null,
      region: input.region?.trim() || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      typical_drive_minutes: input.typicalDriveMinutes ?? null,
      access_notes: input.accessNotes?.trim() || null,
      permit_notes: input.permitNotes?.trim() || null,
      ticket_notes: input.ticketNotes?.trim() || null,
      best_time_notes: input.bestTimeNotes?.trim() || null,
      notes: input.notes?.trim() || null,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      { entityType: "location", entityId: created.id as string, verb: "created", summary: `${name} added to the location list.` },
      { action: "location.create", entityLabel: name, after: input },
    );

    revalidatePath("/os/admin/catalog");
    return ok({ id: created.id as string }, `${name} added.`);
  });
}

// ---------------------------------------------------------------------------
// PEOPLE
// ---------------------------------------------------------------------------

export async function createEmployee(input: {
  fullName: string;
  displayName?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  employmentType?: string | null;
  primaryUnitId?: string | null;
  skills?: string[];
  languages?: string[];
  homeCity?: string | null;
  canDrive?: boolean;
  dayRateAmount?: number | null;
  dayRateCurrency?: string | null;
  hiredOn?: string | null;
  emergencyContact?: string | null;
  notes?: string | null;
}): Promise<ActionResult<{ id: string; code: string }>> {
  return guarded("team.create", async (actor) => {
    const fullName = input.fullName.trim();
    if (!fullName) return fail("The person needs a name");

    const db = osdb();
    const org = await getOrg();

    // A day rate is pay. Adding someone is not the same authority as setting
    // what they cost, so the rate is only accepted from somebody who holds
    // team.rates — and it is dropped quietly rather than refused, so a
    // coordinator can still add the person.
    const maySetRate = Boolean(actor.permissions["team.rates"]);
    if (input.dayRateAmount != null && input.dayRateAmount > 0 && !maySetRate) {
      return fail(
        "You cannot set a day rate",
        "Add the person without one and ask someone with team rates access to fill it in.",
      );
    }

    const email = input.email?.trim().toLowerCase() || null;
    if (email) {
      const { data: existing } = await db
        .from("os_employees")
        .select("id, code, full_name")
        .eq("org_id", org.id)
        .is("archived_at", null)
        .ilike("email", email)
        .limit(1);
      if (existing?.length) {
        return fail(
          `${existing[0].full_name} already has a record (${existing[0].code})`,
          "Open their profile instead — a second record would split their trip history and their availability.",
        );
      }
    }

    const code = await nextCode("os_employees", org.id, "EE", 3);

    const { data: created, error } = await db.from("os_employees").insert({
      org_id: org.id,
      // Deliberately no user_id. A record is not a login; linking an account
      // is a separate act under Admin, Users and access.
      user_id: null,
      code,
      full_name: fullName,
      display_name: input.displayName?.trim() || fullName.split(" ")[0],
      email,
      phone: input.phone?.trim() || null,
      whatsapp: input.whatsapp?.trim() || null,
      job_title: input.jobTitle?.trim() || null,
      department: input.department?.trim() || null,
      employment_type: input.employmentType || "staff",
      status: "active",
      primary_unit_id: input.primaryUnitId || null,
      skills: input.skills ?? [],
      languages: input.languages ?? [],
      home_city: input.homeCity?.trim() || null,
      can_drive: Boolean(input.canDrive),
      day_rate_amount: maySetRate ? input.dayRateAmount ?? null : null,
      day_rate_currency: input.dayRateCurrency || "USD",
      hired_on: input.hiredOn || null,
      emergency_contact: input.emergencyContact?.trim() || null,
      notes: input.notes?.trim() || null,
    }).select("id").single();
    if (error) throw error;

    await record(
      actor,
      {
        entityType: "employee",
        entityId: created.id as string,
        verb: "created",
        summary: `${fullName} added to the team as ${code}.`,
        meta: { employmentType: input.employmentType ?? "staff" },
      },
      {
        action: "employee.create",
        entityLabel: `${code} — ${fullName}`,
        after: { ...input, code, dayRateAmount: maySetRate ? input.dayRateAmount ?? null : null },
      },
    );

    revalidatePath("/os/team");
    return ok(
      { id: created.id as string, code },
      `${fullName} added as ${code}. They can be scheduled now; grant a role to give them a sign-in.`,
    );
  });
}
