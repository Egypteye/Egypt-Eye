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
  ["DO", "Dominican Republic", "+1"],
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

  // ---------------------------------------------------------------------------
  // THE REST OF THE WORLD, added when this list stopped being the booking
  // popup's alone.
  //
  // It held 105 countries, chosen as the markets Egypt Eye actually sells to.
  // That was defensible while the only other phone field on the site used
  // src/content/countryCodes.ts, which carries all 204 and says plainly why:
  // "a traveler whose country is missing from the dropdown cannot submit the
  // form at all."
  //
  // Then the country code became mandatory on every form, all of them reading
  // THIS list, and the gap turned into a wall: a traveller from Zimbabwe or
  // Venezuela could not give us a number, and on the forms where the field is
  // required could not send the form. The curated head above still comes
  // first, because a select of two hundred alphabetical entries makes the
  // common case the slowest one. These simply follow it, so the list is both
  // fast for the usual answer and complete for the unusual one.
  // ---------------------------------------------------------------------------
  ["AD", "Andorra", "+376"],
  ["AO", "Angola", "+244"],
  ["AG", "Antigua and Barbuda", "+1"],
  ["AW", "Aruba", "+297"],
  ["BS", "Bahamas", "+1"],
  ["BB", "Barbados", "+1"],
  ["BZ", "Belize", "+501"],
  ["BJ", "Benin", "+229"],
  ["BM", "Bermuda", "+1"],
  ["BT", "Bhutan", "+975"],
  ["BO", "Bolivia", "+591"],
  ["BW", "Botswana", "+267"],
  ["BN", "Brunei", "+673"],
  ["BF", "Burkina Faso", "+226"],
  ["BI", "Burundi", "+257"],
  ["CV", "Cape Verde", "+238"],
  ["KY", "Cayman Islands", "+1"],
  ["CF", "Central African Republic", "+236"],
  ["TD", "Chad", "+235"],
  ["KM", "Comoros", "+269"],
  ["CG", "Congo - Brazzaville", "+242"],
  ["CD", "Congo - Kinshasa", "+243"],
  ["CI", "Côte d’Ivoire", "+225"],
  ["CU", "Cuba", "+53"],
  ["DJ", "Djibouti", "+253"],
  ["DM", "Dominica", "+1"],
  ["GQ", "Equatorial Guinea", "+240"],
  ["ER", "Eritrea", "+291"],
  ["SZ", "Eswatini", "+268"],
  ["FJ", "Fiji", "+679"],
  ["GA", "Gabon", "+241"],
  ["GM", "Gambia", "+220"],
  ["GI", "Gibraltar", "+350"],
  ["GL", "Greenland", "+299"],
  ["GD", "Grenada", "+1"],
  ["GN", "Guinea", "+224"],
  ["GW", "Guinea-Bissau", "+245"],
  ["GY", "Guyana", "+592"],
  ["HT", "Haiti", "+509"],
  ["HN", "Honduras", "+504"],
  ["IR", "Iran", "+98"],
  ["JM", "Jamaica", "+1"],
  ["KI", "Kiribati", "+686"],
  ["KG", "Kyrgyzstan", "+996"],
  ["LA", "Laos", "+856"],
  ["LS", "Lesotho", "+266"],
  ["LR", "Liberia", "+231"],
  ["LI", "Liechtenstein", "+423"],
  ["MO", "Macao SAR China", "+853"],
  ["MG", "Madagascar", "+261"],
  ["MW", "Malawi", "+265"],
  ["MV", "Maldives", "+960"],
  ["ML", "Mali", "+223"],
  ["MH", "Marshall Islands", "+692"],
  ["MR", "Mauritania", "+222"],
  ["MU", "Mauritius", "+230"],
  ["FM", "Micronesia", "+691"],
  ["MC", "Monaco", "+377"],
  ["MN", "Mongolia", "+976"],
  ["ME", "Montenegro", "+382"],
  ["MZ", "Mozambique", "+258"],
  ["MM", "Myanmar (Burma)", "+95"],
  ["NA", "Namibia", "+264"],
  ["NR", "Nauru", "+674"],
  ["NI", "Nicaragua", "+505"],
  ["NE", "Niger", "+227"],
  ["KP", "North Korea", "+850"],
  ["MK", "North Macedonia", "+389"],
  ["PW", "Palau", "+680"],
  ["PG", "Papua New Guinea", "+675"],
  ["PY", "Paraguay", "+595"],
  ["PR", "Puerto Rico", "+1"],
  ["RW", "Rwanda", "+250"],
  ["KN", "Saint Kitts and Nevis", "+1"],
  ["LC", "Saint Lucia", "+1"],
  ["VC", "Saint Vincent and the Grenadines", "+1"],
  ["WS", "Samoa", "+685"],
  ["SM", "San Marino", "+378"],
  ["ST", "São Tomé and Príncipe", "+239"],
  ["SN", "Senegal", "+221"],
  ["SC", "Seychelles", "+248"],
  ["SL", "Sierra Leone", "+232"],
  ["SB", "Solomon Islands", "+677"],
  ["SO", "Somalia", "+252"],
  ["SS", "South Sudan", "+211"],
  ["SR", "Suriname", "+597"],
  ["SY", "Syria", "+963"],
  ["TJ", "Tajikistan", "+992"],
  ["TL", "Timor-Leste", "+670"],
  ["TG", "Togo", "+228"],
  ["TO", "Tonga", "+676"],
  ["TT", "Trinidad and Tobago", "+1"],
  ["TM", "Turkmenistan", "+993"],
  ["TV", "Tuvalu", "+688"],
  ["VU", "Vanuatu", "+678"],
  ["VA", "Vatican City", "+39"],
  ["VE", "Venezuela", "+58"],
  ["ZM", "Zambia", "+260"],
  ["ZW", "Zimbabwe", "+263"],
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
