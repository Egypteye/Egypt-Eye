import DealPage, { generateMetadata as dealMetadata } from "../../../partnerships/deals/[ref]/page";

export const dynamic = "force-dynamic";
export const generateMetadata = dealMetadata;

// The B2C deal screen IS the B2B deal screen. One data model, one component —
// building a second copy is exactly what "do not create disconnected B2C and
// B2B systems" rules out, and the two would drift apart within a month. This
// route exists only so a reservations link stays inside the reservations
// workspace; the page itself works out which pipeline the deal belongs to.
export default DealPage;
