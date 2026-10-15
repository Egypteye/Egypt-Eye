# Legal applicability matrix

Classification used, per the brief:

- **A — Confirmed applicable** on available evidence
- **B — Potentially applicable**, additional facts needed
- **C — Not currently applicable** on documented evidence
- **D — Best practice**, not a verified legal mandate
- **E — Unresolved**, specialist legal review required

**Evidence quality is stated for every row.** Where only secondary sources were
available, the row says so. No row below is a legal opinion.

---

## Egypt

| # | Requirement | Trigger | Class | Evidence & confidence |
|---|---|---|---|---|
| EG‑1 | **PDPL 151/2020 + Executive Regulations (Decree 816/2025)** — prior authorisation from the PDPC for most processing, DPO where applicable, 72h breach notification | Processing personal data as an Egyptian establishment | **A** | Regulations reported issued **1 Nov 2025**, compliance period **~1 Nov 2026**. Sources disagree marginally (one says 31 Oct 2026). *Secondary sources only — law-firm commentary and trackers. Arabic original not read.* **Confirm against the Official Gazette.** |
| EG‑2 | PDPC licensing/permit route | As EG‑1 | **E** | Multiple sources report the PDPC is **established but not operational**, the application portal is **not live**, and forms are **unpublished**. If true, the obligation may not currently be dischargeable. Needs Egyptian counsel. |
| EG‑3 | **Consumer Protection Law 181/2018** — pre-contract disclosure, pricing clarity, refund/cancellation terms | Selling to consumers from Egypt | **B** | Law exists and is in force. We did **not** verify which specific disclosure articles bind distance sales. Scope analysis required. |
| EG‑4 | **Tourism / tour-operator licensing** | Operating or reselling tours and transfers | **E** | **Cannot be determined from a repository.** Egypt regulates tourism companies by licence category. Whether Egypt Eye holds the right category, and whether photoshoots or shopping days fall inside it, is a documentary question for the owner and counsel. |
| EG‑5 | Essential-oil product rules (cosmetic vs fragrance vs therapeutic classification, labelling, import) | Selling physical oils | **B** | Deferred: no oil is sold online and none carries a price (`check-oils` enforces this). Becomes live the moment oils are sold. |
| EG‑6 | Tax and e-invoicing | Revenue in Egypt | **E** | Outside the repository entirely. Owner's accountant. |

## United States

| # | Requirement | Trigger | Class | Evidence & confidence |
|---|---|---|---|---|
| US‑1 | **ADA Title III website accessibility** | A "place of public accommodation" with a nexus to goods/services | **B** | Private-plaintiff litigation is extensive and circuits differ on whether a website alone is a public accommodation. Egypt Eye has no US physical premises, which is a material fact in several circuits. **Do not treat WCAG as the statutory standard** — there is no general ADA web regulation for private businesses. Accessibility work is justified on customer and risk grounds regardless. |
| US‑2 | **CCPA / CPRA** | Any one of: **≥ $26,625,000** gross annual revenue (inflation-adjusted, not $25m); **≥ 100,000** California consumers/households; **≥ 50%** of revenue from selling/sharing personal information | **C — almost certainly not applicable** | Thresholds consistent across 2026 sources. A private tour operator would have to be very large to cross any of them. *Owner should confirm revenue.* **No personal information is sold or shared — there are no trackers at all**, which disposes of the third test outright. |
| US‑3 | **FTC endorsement & reviews rules** | Testimonials, influencer collaborations, reviews on the site | **A** | The site publishes reviews and runs influencer collaborations. Disclosure and authenticity obligations apply to the advertiser, not only the influencer. The project already forbids fabricating or re-ordering reviews (`check-reviews`), which is the substance of it. |
| US‑4 | State privacy laws beyond California | State-specific thresholds | **C/B** | Most carry volume thresholds similar to or higher than California's. Not applicable on current scale. Revisit if volume grows. |
| US‑5 | Copyright / publicity rights in photographs | Using customer, influencer or stock imagery commercially | **B** | Real exposure. Model releases and image licences are documentary — see `03-owner-actions.md`. |

## European Union & United Kingdom

| # | Requirement | Trigger | Class | Evidence & confidence |
|---|---|---|---|---|
| EU‑1 | **GDPR Art. 3(2)(a)** — offering goods/services to data subjects in the EU | *Targeting*, not mere accessibility: currency, language, country targeting, EU marketing | **B** | The site is multilingual and markets internationally, which is evidence of targeting. Needs a factual assessment of marketing and customer base. **Being viewable in the EU is not the test** and must not be treated as one. |
| EU‑2 | **ePrivacy / cookie consent** | Storing or accessing information on a user's device beyond what is strictly necessary | **C — on current evidence** | **No analytics, no advertising, no third-party scripts.** The only browser storage is first-party and functional (journey planner, packing list, popup dismissal), which in most national implementations falls within the strict-necessity exemption. **This changes the day any analytics is added** — see `03-owner-actions.md`. |
| EU‑3 | **European Accessibility Act, Directive (EU) 2019/882** — applies from **28 June 2025** | E-commerce services to EU consumers. **Follows the consumer, not the trader's establishment** — an Egyptian business can be in scope | **B, likely exempt** | **Microenterprise services exemption**: fewer than **10** persons **and** annual turnover **or** balance-sheet total **≤ €2 million**. The headcount limit is strict; the financial test is either/or. Egypt Eye is very likely below both — **but only the owner can confirm**. *Article numbers in the secondary sources conflicted; verify against the Official Journal text.* |
| EU‑4 | Consumer Rights Directive — distance selling, 14-day withdrawal | Selling to EU consumers at a distance | **B** | Note the **customised-goods exception**: a cartouche engraved with a customer's name is made to the consumer's specification, which is a recognised carve-out from the withdrawal right. That exception must be stated before purchase to be relied on. Currently it is not. |
| UK‑1 | UK GDPR / PECR | As EU‑1 and EU‑2 | **B/C** | Mirrors the EU rows. |
| UK‑2 | Equality Act 2010 — reasonable adjustments | Providing services to UK consumers | **B** | Service-provider duty. No fixed technical standard; WCAG is evidence of reasonableness, not the statute. |

## Jurisdictions deliberately excluded

Not assessed, because there is no evidence of meaningful connection: Canada,
Australia, Brazil, China, India, and the rest. The brief asked for this
restraint and it is the right call — an unmanageable list of countries would
dilute the three that matter.

---

## Missing facts that would resolve the open classifications

1. Company headcount and annual turnover → resolves **EU‑3** (EAA exemption).
2. Annual gross revenue → confirms **US‑2** (CCPA, expected to be clearly below).
3. Tourism licence category held, and whether it covers photoshoots and shopping days → **EG‑4**.
4. Commercial registration number, tax number, registered address → required for trader identification and for any accurate legal page.
5. Where EU/UK customers actually come from, and whether marketing targets them → **EU‑1**, **EU‑4**, **UK‑1**.
6. Whether a DPO has been appointed, and whether any PDPC filing has been attempted → **EG‑1**, **EG‑2**.
7. Image licences and model releases for customer and influencer photography → **US‑5**.
8. Actual data-retention practice — how long bookings, enquiries and emails are kept.

---

## Sources

Egypt PDPL and executive regulations:
- https://www.tamimi.com/law_update_articles/from-policy-to-practice-egypt-issues-executive-regulations-of-the-personal-data-protection-law/
- https://www.shandpartners.com/insights/briefings/telecoms-media-technology/the-issuance-of-the-executive-regulations-of-the-data-protection-law-and-the-establishment-of-the-data-protection-centre/
- https://www.lexismiddleeast.com/eJournal/2026-03-05_1/en
- https://www.dataguidance.com/jurisdictions/egypt
- Law text (unofficial English): https://eg.andersen.com/wp-content/uploads/2025/06/Law-No.-151-OF-2020.pdf
- https://research.lawlab.africa/egypt/

European Accessibility Act — **all secondary; verify against Directive (EU) 2019/882 in the Official Journal**:
- https://accessible.org/eaa-ecommerce-services-requirements/
- https://goingstellar.ro/research/european-accessibility-act-online-stores/
- https://www.complymo.com/blog/european-accessibility-act-websites

CCPA / CPRA thresholds:
- https://www.clym.io/blog/ccpa-applicability-guide
- https://www.jacksonlewis.com/insights/navigating-california-consumer-privacy-act-30-essential-faqs-covered-businesses-including-clarifying-regulations-effective-1126
- https://transcend.io/blog/cpra-vs-ccpa
