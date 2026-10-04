/**
 * Guards what `?only=treasures&update=1` would do to the live dataset.
 *
 * The migration writes to production Sanity, and the route that calls this
 * cannot be run without production credentials — so the decision about what
 * to overwrite lives in a pure module (src/lib/migrationPlan.ts) and is
 * asserted here instead of being discovered in production.
 *
 * The property that matters most is negative: an update must never blank a
 * price, a photograph, a variant or an SEO override that exists only in the
 * Studio. Those fields have no counterpart in the content files, and the
 * whole point of Take Egypt Home being Studio-editable is that they survive.
 */
import { planTreasureUpdate, sameValue } from "../src/lib/migrationPlan";
import type { PlannedDoc } from "../src/lib/migrationPlan";

const errors: string[] = [];
const ok = (label: string, condition: boolean) => {
  if (!condition) errors.push(label);
};

const product = (slug: string, fields: Record<string, unknown> = {}): PlannedDoc => ({
  _id: `treasureProduct-${slug}`,
  _type: "treasureProduct",
  slug: { _type: "slug", current: slug },
  name: slug,
  blurb: "a blurb",
  status: "onRequest",
  placeholder: false,
  order: 1,
  ...fields,
});

// ---------------------------------------------------------------------------
// The negative property: Studio-only fields are never in a patch.
// ---------------------------------------------------------------------------
const liveWithStudioWork = {
  _id: "treasureProduct-khufu-cartouche",
  _type: "treasureProduct",
  slug: { _type: "slug", current: "khufu-cartouche" },
  name: "Khufu Cartouche",
  blurb: "an older blurb",
  status: "onRequest",
  placeholder: false,
  order: 1,
  // None of these exist in the content files.
  price: { amount: 240, _type: "price" },
  image: { _type: "image", asset: { _ref: "image-abc" } },
  gallery: [{ _type: "image", asset: { _ref: "image-def" } }],
  variants: [{ _key: "v1", label: "18k", price: { amount: 420 } }],
  seo: { _type: "object", title: "Khufu cartouche, handmade in Cairo" },
  availability: "limited",
};

const plan = planTreasureUpdate(
  [product("khufu-cartouche", { name: "Khufu Cartouche", blurb: "the new blurb" })],
  [liveWithStudioWork]
);

ok("an existing product is an update, not a create", plan.update.length === 1 && plan.create.length === 0);
const patched = plan.update[0];
ok("the changed blurb is patched", patched.fields.includes("blurb"));
for (const studioField of ["price", "image", "gallery", "variants", "seo", "availability"]) {
  ok(`an update must not touch the Studio-owned ${studioField}`, !(studioField in patched.changed));
}
ok("only the fields that actually differ are patched", patched.fields.join() === "blurb");

// ---------------------------------------------------------------------------
// A field the content file does not define is left alone, not unset. Removing
// a line from a content file must not blank the document in Sanity.
// ---------------------------------------------------------------------------
const noDescription = planTreasureUpdate(
  [product("x", { description: undefined })],
  [{ ...product("x"), description: "written in the Studio" }]
);
ok(
  "a field absent from the content file is not unset",
  noDescription.update.length === 0 || !("description" in noDescription.update[0].changed)
);

// ---------------------------------------------------------------------------
// Unchanged means unchanged — including arrays that have round-tripped
// through Sanity and come back carrying _key/_type. Without that, every run
// would rewrite every array and the diff would be meaningless.
// ---------------------------------------------------------------------------
const specs = [{ label: "Metal", value: "Silver" }];
const roundTripped = planTreasureUpdate(
  [product("y", { specs: specs.map((s, i) => ({ ...s, _type: "treasureSpec", _key: `y-spec-${i}` })) })],
  [{ ...product("y"), specs: specs.map((s) => ({ ...s, _type: "treasureSpec", _key: "whatever-sanity-made" })) }]
);
ok("an array that only differs by _key is not a change", roundTripped.unchanged.length === 1);
ok("sameValue ignores _key", sameValue([{ a: 1, _key: "p" }], [{ a: 1, _key: "q" }]));
ok("sameValue ignores key order", sameValue({ a: 1, b: 2 }, { b: 2, a: 1 }));
ok("sameValue still sees a real difference", !sameValue({ a: 1 }, { a: 2 }));
ok("sameValue sees a changed array length", !sameValue([1, 2], [1]));

// ---------------------------------------------------------------------------
// The live situation: Sanity holds three sample cartouches from the first
// migration; the content files now describe four real ones. The samples are
// not in the content files, so they are orphans — reported, never deleted.
// ---------------------------------------------------------------------------
const samples = ["classic-cartouche-pendant", "two-name-cartouche", "open-back-cartouche"];
const real = ["khufu-cartouche", "ramsis-cartouche", "nefertiti-cartouche", "tutankhamun-bracelet"];
const catalogue = planTreasureUpdate(
  real.map((s) => product(s)),
  samples.map((s) => ({ ...product(s) }))
);
ok("the four real cartouches are created", catalogue.create.length === 4);
ok("the three stale samples are reported as orphans", catalogue.orphans.length === 3);
ok("no orphan is silently deleted", !("delete" in catalogue));
ok("nothing is updated when the slugs do not overlap", catalogue.update.length === 0);

// ---------------------------------------------------------------------------
// And the real content files, so this fails if the catalogue drifts from what
// the plan would do.
// ---------------------------------------------------------------------------
const { treasureProducts, treasureCategories } = await import("../src/content/treasures");
const realDocs: PlannedDoc[] = [
  ...treasureCategories.map((c) => ({
    _id: `treasureCategory-${c.slug}`,
    _type: "treasureCategory",
    slug: { _type: "slug", current: c.slug },
    title: c.title,
  })),
  ...treasureProducts.map((p) => ({
    _id: `treasureProduct-${p.slug}`,
    _type: "treasureProduct",
    slug: { _type: "slug", current: p.slug },
    name: p.name,
  })),
];
const fromEmpty = planTreasureUpdate(realDocs, []);
ok(
  `an empty dataset creates every category and product (${fromEmpty.create.length})`,
  fromEmpty.create.length === treasureCategories.length + treasureProducts.length
);
ok("an empty dataset has nothing to update or orphan", fromEmpty.update.length === 0 && fromEmpty.orphans.length === 0);

const idempotent = planTreasureUpdate(realDocs, realDocs as unknown as Record<string, unknown>[]);
ok("re-running against an identical dataset changes nothing", idempotent.update.length === 0);
ok("re-running against an identical dataset creates nothing", idempotent.create.length === 0);

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\ncheck-migration-plan: ${errors.length} problem(s)\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("");
  process.exit(1);
}
console.log(
  "check-migration-plan: ok — updates patch only changed content fields, " +
    "Studio-owned fields are never written, orphans are reported not deleted, re-runs are no-ops."
);
