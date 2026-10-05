// Dial codes for the phone field in the booking popup.
//
// The country code is mandatory rather than optional, and that is a decision
// about what the desk can actually do with the number. Egypt Eye takes
// bookings from inside Egypt and from everywhere else, and a bare "01012345678"
// is unreachable from a phone outside the country while "1012345678" could be
// Egyptian or American. A number nobody can dial is the same as no number, and
// with email now optional the phone is often the only way back to a customer.
//
// Egypt leads the list because it is both the default and the most common
// answer; the rest follow in the order Egypt Eye's travellers actually arrive
// in, then alphabetically. A select of two hundred alphabetical entries makes
// the common case the slowest one.

export type DialCode = {
  /** ISO 3166-1 alpha-2, used for the flag and as the stable option value. */
  iso: string;
  name: string;
  /** Including the leading +, because that is what a customer recognises. */
  dial: string;
};

// [iso, name, dial]. Kept as tuples so the list stays readable at a glance and
// a mistake in it is visible rather than buried in object punctuation.
const CODES: [string, string, string][] = [
  ["EG", "Egypt", "+20"],

  // The markets Egypt Eye's bookings come from, ahead of the alphabet.
  ["US", "United States", "+1"],
  ["GB", "United Kingdom", "+44"],
  ["AE", "United Arab Emirates", "+971"],
  ["SA", "Saudi Arabia", "+966"],
  ["DE", "Germany", "+49"],
  ["FR", "France", "+33"],
  ["IT", "Italy", "+39"],
  ["ES", "Spain", "+34"],
  ["NL", "Netherlands", "+31"],
  ["CA", "Canada", "+1"],
  ["AU", "Australia", "+61"],
  ["IN", "India", "+91"],
  ["BR", "Brazil", "+55"],
  ["JO", "Jordan", "+962"],

  ["AF", "Afghanistan", "+93"],
  ["AL", "Albania", "+355"],
  ["DZ", "Algeria", "+213"],
  ["AR", "Argentina", "+54"],
  ["AM", "Armenia", "+374"],
  ["AT", "Austria", "+43"],
  ["AZ", "Azerbaijan", "+994"],
  ["BH", "Bahrain", "+973"],
  ["BD", "Bangladesh", "+880"],
  ["BY", "Belarus", "+375"],
  ["BE", "Belgium", "+32"],
  ["BA", "Bosnia and Herzegovina", "+387"],
  ["BG", "Bulgaria", "+359"],
  ["KH", "Cambodia", "+855"],
  ["CM", "Cameroon", "+237"],
  ["CL", "Chile", "+56"],
  ["CN", "China", "+86"],
  ["CO", "Colombia", "+57"],
  ["CR", "Costa Rica", "+506"],
  ["HR", "Croatia", "+385"],
  ["CY", "Cyprus", "+357"],
  ["CZ", "Czechia", "+420"],
  ["DK", "Denmark", "+45"],
  ["DO", "Dominican Republic", "+1809"],
  ["EC", "Ecuador", "+593"],
  ["SV", "El Salvador", "+503"],
  ["EE", "Estonia", "+372"],
  ["ET", "Ethiopia", "+251"],
  ["FI", "Finland", "+358"],
  ["GE", "Georgia", "+995"],
  ["GH", "Ghana", "+233"],
  ["GR", "Greece", "+30"],
  ["GT", "Guatemala", "+502"],
  ["HK", "Hong Kong", "+852"],
  ["HU", "Hungary", "+36"],
  ["IS", "Iceland", "+354"],
  ["ID", "Indonesia", "+62"],
  ["IQ", "Iraq", "+964"],
  ["IE", "Ireland", "+353"],
  ["IL", "Israel", "+972"],
  ["JP", "Japan", "+81"],
  ["KZ", "Kazakhstan", "+7"],
  ["KE", "Kenya", "+254"],
  ["KW", "Kuwait", "+965"],
  ["LV", "Latvia", "+371"],
  ["LB", "Lebanon", "+961"],
  ["LY", "Libya", "+218"],
  ["LT", "Lithuania", "+370"],
  ["LU", "Luxembourg", "+352"],
  ["MY", "Malaysia", "+60"],
  ["MT", "Malta", "+356"],
  ["MX", "Mexico", "+52"],
  ["MD", "Moldova", "+373"],
  ["MA", "Morocco", "+212"],
  ["NP", "Nepal", "+977"],
  ["NZ", "New Zealand", "+64"],
  ["NG", "Nigeria", "+234"],
  ["NO", "Norway", "+47"],
  ["OM", "Oman", "+968"],
  ["PK", "Pakistan", "+92"],
  ["PS", "Palestine", "+970"],
  ["PA", "Panama", "+507"],
  ["PE", "Peru", "+51"],
  ["PH", "Philippines", "+63"],
  ["PL", "Poland", "+48"],
  ["PT", "Portugal", "+351"],
  ["QA", "Qatar", "+974"],
  ["RO", "Romania", "+40"],
  ["RU", "Russia", "+7"],
  ["RS", "Serbia", "+381"],
  ["SG", "Singapore", "+65"],
  ["SK", "Slovakia", "+421"],
  ["SI", "Slovenia", "+386"],
  ["ZA", "South Africa", "+27"],
  ["KR", "South Korea", "+82"],
  ["LK", "Sri Lanka", "+94"],
  ["SD", "Sudan", "+249"],
  ["SE", "Sweden", "+46"],
  ["CH", "Switzerland", "+41"],
  ["TW", "Taiwan", "+886"],
  ["TZ", "Tanzania", "+255"],
  ["TH", "Thailand", "+66"],
  ["TN", "Tunisia", "+216"],
  ["TR", "Türkiye", "+90"],
  ["UG", "Uganda", "+256"],
  ["UA", "Ukraine", "+380"],
  ["UY", "Uruguay", "+598"],
  ["UZ", "Uzbekistan", "+998"],
  ["VN", "Vietnam", "+84"],
  ["YE", "Yemen", "+967"],
];

export const DIAL_CODES: readonly DialCode[] = CODES.map(([iso, name, dial]) => ({ iso, name, dial }));

/** The default selection: most of Egypt Eye's phone numbers are Egyptian. */
export const DEFAULT_DIAL_ISO = "EG";

const BY_ISO = new Map(DIAL_CODES.map((entry) => [entry.iso, entry]));

export function dialCodeFor(iso: unknown): DialCode | null {
  return typeof iso === "string" ? BY_ISO.get(iso.toUpperCase()) ?? null : null;
}

/**
 * The flag, derived from the ISO code rather than stored.
 *
 * Two letters offset into the regional-indicator block. Deriving it means a
 * new country is one line above and cannot arrive with the wrong flag pasted
 * beside it.
 */
export function flagFor(iso: string): string {
  if (!/^[A-Za-z]{2}$/.test(iso)) return "";
  return String.fromCodePoint(
    ...iso
      .toUpperCase()
      .split("")
      .map((char) => 0x1f1e6 + (char.charCodeAt(0) - 65))
  );
}
