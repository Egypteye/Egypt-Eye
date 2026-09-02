import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import { SmartImage } from "@/components/SmartImage";
import { SectionHeading } from "@/components/SectionHeading";
import { TestimonialCard } from "@/components/TestimonialCard";
import { SocialLinks } from "@/components/SocialLinks";
import { WhatsAppBookButton } from "@/components/WhatsAppBookButton";
import { Reveal } from "@/components/Reveal";
import { Frame, IndexRow, Numeral, Photo, Rule, Wordmark } from "./parts";
import {
  agencyTrips,
  collaborators,
  coveredDestinations,
  groundOperations,
  groupHeroPhoto,
  headlineAgencyPartner,
  headlineVipGuest,
  hotelPartners,
  vipClients,
} from "@/content/aboutCredibility";
import {
  getAboutPage,
  getContactPage,
  getSiteSettings,
  getTestimonials,
  getTours,
} from "@/sanity/fetchers";
import { siteUrl } from "@/content/seo";

export const metadata = {
  title: "About Egypt Eye — Who Travels With Us, and Who Trusts Us",
  description:
    "Travel agencies, Bollywood actors, Olympians and creators have all handed Egypt Eye their trip to Egypt. The agencies, the guests, the trips and the dates — on one page.",
  alternates: { canonical: `${siteUrl}/about` },
};

// Photos that carry a caption in the mosaic. The hero group shot and the two
// VIP portraits are placed by hand elsewhere on the page, so the mosaic is
// exactly "every trip in the index that came with a photograph".
const tripPhotos = agencyTrips.filter((t) => t.photo);

export default async function AboutPage() {
  const [site, page, contact, testimonials, tours] = await Promise.all([
    getSiteSettings(),
    getAboutPage(),
    getContactPage(),
    getTestimonials(),
    getTours(),
  ]);
  const featuredTestimonials = testimonials.slice(0, 6);
  const destinationCount =
    coveredDestinations.egypt.length + coveredDestinations.jordan.length;

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────
          Deliberately not the full-bleed banner every other page opens with.
          This page's job is to be believed, so it opens on a split: the claim
          on one side, and a photograph of an actual group of actual clients
          on the other. */}
      <section className="relative overflow-hidden bg-ink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-48 -top-40 h-[34rem] w-[34rem] rounded-full bg-gold/[0.13] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 bottom-[-14rem] h-[30rem] w-[30rem] rounded-full bg-nile/20 blur-3xl"
        />
        <Container className="relative grid gap-14 pb-20 pt-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-20 lg:pb-28 lg:pt-40">
          <div>
            <Rule tone="dark" />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
              {page.heroEyebrow}
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1.08] text-cream sm:text-5xl lg:text-[3.4rem]">
              {page.heroHeadline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/70">
              {site.description}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/customize"
                className="group inline-flex items-center gap-3 rounded-full bg-gold py-2.5 pl-6 pr-2.5 text-sm font-semibold text-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light active:scale-[0.98]"
              >
                Plan Your Trip
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
              <Link
                href="#the-record"
                className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-cream/85 transition-colors duration-300 hover:border-gold/60 hover:text-gold-light"
              >
                See Who Travels With Us
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-3">
              {[
                { t: "Based in", d: site.footer.location },
                { t: "We operate in", d: "Egypt & Jordan" },
                { t: "In-house", d: "Tours, photography, concierge" },
              ].map((item) => (
                <div key={item.t}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/55">
                    {item.t}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-cream/85">{item.d}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-5 gap-4 sm:gap-5">
            <Frame tone="dark" className="col-span-5 sm:col-span-3">
              <div className="relative aspect-[4/5] w-full">
                <SmartImage
                  image={page.heroImage.image}
                  tone={page.heroImage.tone}
                  alt=""
                  className="absolute inset-0"
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 32vw"
                />
              </div>
            </Frame>
            <Photo
              src={groupHeroPhoto.photo}
              alt={groupHeroPhoto.alt}
              ratio="800 / 533"
              caption={groupHeroPhoto.caption}
              tone="dark"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 22vw"
              className="col-span-5 self-center sm:col-span-2 sm:mt-16"
            />
          </div>
        </Container>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Rule />
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
              {page.storyEyebrow}
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {page.storyTitle}
            </h2>
            <div className="mt-7 space-y-5 text-[17px] leading-relaxed text-ink-soft/85">
              <p>
                Egypt Eye started with a straightforward idea: that a trip to Egypt shouldn&rsquo;t be
                a coach, a checklist, and a photo you took yourself in a hurry. We run private tours
                for travelers who came here for the history, the culture, the desert and the water —
                and we run them with guides who are from here and are genuinely interested in the
                questions you ask.
              </p>
              <p>
                What people book us for, in the end, is a mix that&rsquo;s unusual to find in one
                company. We&rsquo;re the tour operator, the transport, the photographer, and the
                person answering your message at midnight — all the same team. No handoffs to a
                local partner you&rsquo;ve never spoken to, and no surprise about who&rsquo;s meeting
                you at the airport.
              </p>
              <p>
                That&rsquo;s also why agencies keep coming back with their own clients. When a travel
                agency sends you their travelers, they&rsquo;re lending you their reputation. The
                index further down this page is what that has looked like, group by group, since
                February 2022.
              </p>
            </div>
          </div>

          <div className="lg:pt-16">
            <Photo
              src="/photos/about/la-adams-travel-luxor-temple.jpg"
              alt="A traveler with The LA Adams Travel standing between the colossi at Luxor Temple"
              ratio="480 / 320"
              caption="The LA Adams Travel · Luxor"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />

            <div className="mt-6 rounded-[2rem] bg-ink p-1.5 ring-1 ring-black/5">
              <blockquote className="rounded-[1.625rem] px-7 py-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-9">
                <Rule tone="dark" />
                <p className="mt-5 font-display text-xl leading-relaxed text-cream sm:text-[1.5rem]">
                  &ldquo;{site.positioning}&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </Container>
      </section>

      {/* ── By the numbers ─────────────────────────────────────────────────
          Every tile is a `.length` of a list that appears on this same page,
          or a live count from the tour catalog. Nothing here is estimated,
          and nothing is rounded up. */}
      <section className="bg-ink py-20 lg:py-28">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <Rule tone="dark" />
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
                By the Numbers
              </p>
              <h2 className="mt-4 text-balance font-display text-3xl font-semibold text-cream sm:text-4xl">
                Six numbers, and the list behind each one
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-cream/65">
                Anyone can print a big number on a travel website. These count something specific —
                and every list they count is printed further down this page, name by name, so you
                can check the arithmetic yourself.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                value: String(agencyTrips.length),
                label: "Travel agencies & groups hosted",
                source: "Each one named — most with a destination and month — in the index below.",
              },
              {
                value: String(vipClients.length),
                label: "VIP guests looked after",
                source: "Actors, Olympians, journalists, models and creators. All named below.",
              },
              {
                value: String(collaborators.length),
                label: "Collaborators & business partners",
                source: "Travel brands and publications we've worked with directly.",
              },
              {
                value: String(destinationCount),
                label: "Destinations we run ourselves",
                source: `${coveredDestinations.egypt.length} across Egypt, ${coveredDestinations.jordan.length} across Jordan — not resold through a third party.`,
              },
              {
                value: String(hotelPartners.length),
                label: "Hotels we book guests into",
                source: "From the Fairmont and Marriott Mena House down to the pyramid-view guesthouses.",
              },
              {
                value: String(tours.length),
                label: "Itineraries published on this site",
                source: "Counted live from our own catalog every time this page is built.",
              },
            ].map((tile, i) => (
              <Reveal key={tile.label} delay={i * 60}>
                <Numeral {...tile} tone="dark" />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Celebrity & VIP ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <Rule />
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
                Celebrity &amp; VIP Experiences
              </p>
              <h2 className="mt-4 text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
                People who could book anywhere in the world booked here
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft/80">
                Bollywood actors, Olympic athletes, journalists and some of the most-followed travel
                creators working today have all put their Egypt trip in our hands — usually with a
                schedule, a camera crew, and no room for a day going wrong.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <Reveal className="h-full sm:col-span-2 lg:col-span-1">
              {/* Sourced from Egypt Eye directly rather than the partner deck,
                  and there's no photograph cleared to publish — so this block
                  is typographic on purpose rather than padded with a stock
                  image of someone else. */}
              <article className="flex h-full flex-col rounded-[2rem] bg-ink p-1.5 ring-1 ring-black/5">
                <div className="flex h-full flex-col rounded-[1.625rem] px-7 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-9 sm:py-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-light">
                    Handled by Egypt Eye
                  </p>
                  <h3 className="mt-5 font-display text-4xl font-semibold leading-none text-cream sm:text-5xl">
                    {headlineVipGuest.name}
                  </h3>
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-cream/50">
                    {headlineVipGuest.role}
                  </p>
                  <div className="my-7 h-px w-full bg-gradient-to-r from-gold/70 via-gold/20 to-transparent" />
                  <p className="text-[15px] leading-relaxed text-cream/75">{headlineVipGuest.fact}</p>
                  <p className="mt-auto pt-8 text-xs leading-relaxed text-cream/50">
                    Planning something with a schedule this tight?{" "}
                    <Link href="/customize" className="text-gold-light underline-offset-4 hover:underline">
                      Tell us the dates.
                    </Link>
                  </p>
                </div>
              </article>
            </Reveal>

            {vipClients
              .filter((v) => v.photo)
              .map((v, i) => (
                <Reveal key={v.name} delay={(i + 1) * 80} className="h-full">
                  <Photo
                    src={v.photo!}
                    alt={v.alt ?? v.name}
                    ratio="3 / 4"
                    caption={[v.name, v.place, v.when].filter(Boolean).join(" · ")}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 26vw"
                  />
                </Reveal>
              ))}
          </div>

          <Reveal>
            <div className="mt-16">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
                The guest list
              </h3>
              <ul className="mt-6 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
                {vipClients.map((v) => (
                  <IndexRow key={v.name} primary={v.name} secondary={v.role} />
                ))}
              </ul>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Trusted by travel agencies ─────────────────────────────────────── */}
      <section id="the-record" className="scroll-mt-24 bg-sand-dim py-20 lg:py-28">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <Rule />
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
                Trusted by Travel Agencies
              </p>
              <h2 className="mt-4 text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
                Other travel professionals hand us their own clients
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft/80">
                It&rsquo;s one thing for a traveler to take a chance on you. It&rsquo;s another for a
                travel agency to put their own name on your work and send you the people who pay
                them. Here is every group that has, with the month they came.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-16">
            <Reveal>
              {/* Sourced from Egypt Eye directly rather than the partner deck. */}
              <article className="rounded-[2rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06] lg:sticky lg:top-28">
                <div className="rounded-[1.625rem] bg-cream px-7 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-9 sm:py-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
                    Longest-running agency partner
                  </p>
                  <h3 className="mt-5 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                    {headlineAgencyPartner.name}
                  </h3>
                  <p className="mt-2.5 text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft/55">
                    {headlineAgencyPartner.role}
                  </p>
                  <div className="my-7 h-px w-full bg-gradient-to-r from-gold/60 via-gold/20 to-transparent" />
                  <p className="font-display text-[2.75rem] font-semibold leading-none tabular-nums text-gold-dark">
                    100+
                  </p>
                  <p className="mt-2 text-sm font-semibold text-ink">travelers a year, through us</p>
                  <p className="mt-5 text-[15px] leading-relaxed text-ink-soft/80">
                    {headlineAgencyPartner.fact}
                  </p>
                  <Link
                    href="/travel-agents"
                    className="group mt-8 inline-flex items-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-sm font-semibold text-cream transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-dark active:scale-[0.98]"
                  >
                    Work With Us as an Agency
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </article>
            </Reveal>

            <Reveal delay={80}>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  Groups we&rsquo;ve hosted
                </h3>
                <ul className="mt-5">
                  {agencyTrips.map((t) => (
                    <IndexRow
                      key={t.group}
                      primary={t.group}
                      secondary={t.place}
                      tertiary={[t.when, t.also].filter(Boolean).join(" · ")}
                    />
                  ))}
                </ul>
                <p className="mt-4 border-t border-black/[0.07] pt-4 text-xs leading-relaxed text-ink-soft/55">
                  Where a group travelled with us more than once, the extra dates are listed
                  alongside. A few of the earliest trips are recorded without a month — those are
                  shown without one rather than given a guessed date.
                </p>

                <h3 className="mt-12 text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  Collaborators &amp; business partners
                </h3>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {collaborators.map((c) => (
                    <Wordmark key={c}>{c}</Wordmark>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── Real people, real experiences ──────────────────────────────────
          A masonry rather than a uniform grid: these are the originals at
          their own crop, captioned with the group and month they belong to.
          Nothing here is stock photography or a hired model. */}
      <section className="bg-ink py-20 lg:py-28">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <Rule tone="dark" />
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
                Real People, Real Experiences
              </p>
              <h2 className="mt-4 text-balance font-display text-3xl font-semibold text-cream sm:text-4xl">
                Every photograph here is a trip we actually ran
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-cream/65">
                No stock library, no models, no borrowed shots. Each caption names the group who
                travelled and the month they were here — the same photos we send agencies when they
                ask what a trip with us looks like.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {tripPhotos.map((t) => (
              <Photo
                key={t.group}
                src={t.photo!}
                alt={t.alt ?? t.group}
                ratio={t.ratio}
                caption={[t.group, t.place, t.when].filter(Boolean).join(" · ")}
                tone="dark"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 46vw, 31vw"
              />
            ))}
          </div>
        </Container>
      </section>

      {/* ── Behind the experience ──────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <Container>
          <Reveal>
            <div className="max-w-2xl">
              <Rule />
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
                Behind the Experience
              </p>
              <h2 className="mt-4 text-balance font-display text-3xl font-semibold text-ink sm:text-4xl">
                What we actually own, and what that changes
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-soft/80">
                Most of what goes wrong on a trip to Egypt goes wrong in the gaps between
                companies — the operator, the driver, the photographer, the person you message when
                something changes. There are no gaps here, because all of it is us.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groundOperations.map((item, i) => (
              <Reveal key={item.title} delay={i * 50} className="h-full">
                <div className="h-full rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06]">
                  <div className="flex h-full flex-col rounded-[1.375rem] bg-cream px-6 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <Rule />
                    <p className="mt-5 font-display text-lg font-semibold text-ink">{item.title}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-soft/75">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-14 grid gap-10 border-t border-black/[0.07] pt-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  Where we run our own trips
                </h3>
                <p className="mt-4 text-sm font-semibold text-ink">Egypt</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {coveredDestinations.egypt.map((d) => (
                    <Wordmark key={d}>{d}</Wordmark>
                  ))}
                </div>
                <p className="mt-6 text-sm font-semibold text-ink">Jordan</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {coveredDestinations.jordan.map((d) => (
                    <Wordmark key={d}>{d}</Wordmark>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
                  Hotels we book guests into
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {hotelPartners.map((h) => (
                    <Wordmark key={h}>{h}</Wordmark>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-ink-soft/70">
                  From international properties on the Nile to the small pyramid-view guesthouses in
                  Giza — we book what suits the trip, and we&rsquo;re the ones who fix it if the room
                  is wrong.{" "}
                  <Link href="/hotel-deals" className="font-semibold text-gold-dark underline-offset-4 hover:underline">
                    See current hotel deals
                  </Link>
                  .
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Why Egypt Eye ──────────────────────────────────────────────────── */}
      <section className="bg-sand-dim py-20 lg:py-28">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Image
                src="/brand/egypt-eye-badge-gold.png"
                alt="Egypt Eye seal"
                width={96}
                height={96}
                className="mx-auto mb-7"
              />
              <SectionHeading
                eyebrow={page.whatWeDoEyebrow}
                title={page.whatWeDoTitle}
                description={page.whatWeDoDescription}
                align="center"
              />
            </div>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {site.pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 60} className="h-full">
                <div className="h-full rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06]">
                  <div className="flex h-full flex-col rounded-[1.375rem] bg-cream px-6 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <p className="font-display text-lg font-semibold text-ink">{p.title}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-soft/75">{p.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mx-auto mt-14 max-w-xl border-t border-black/[0.07] pt-10 text-center text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">
              And three promises we don&rsquo;t break
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {site.trustBadges.map((b, i) => (
              <Reveal key={b.title} delay={i * 70} className="h-full">
                <div className="h-full rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06]">
                  <div className="flex h-full flex-col rounded-[1.375rem] bg-cream px-6 py-7 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    <p className="font-display text-lg font-semibold text-ink">{b.title}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-soft/75">{b.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Testimonials — only shown once real, collected reviews exist in the
          CMS. A short teaser here, with a link through to the full page. */}
      {featuredTestimonials.length > 0 && (
        <section className="py-20 lg:py-28">
          <Container>
            <SectionHeading
              eyebrow="Traveler Stories"
              title="What Our Travelers Say"
              description="Real words from real trips — a small sample of what's waiting for you on the full page."
              align="center"
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTestimonials.map((t, i) => (
                <TestimonialCard key={`${t.name}-${i}`} testimonial={t} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/testimonials"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
              >
                Read All Reviews
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* Contact — folded in here rather than a separate /contact page. The
          `#contact` anchor is linked to from elsewhere on the site, so it
          stays put. */}
      <section id="contact" className="scroll-mt-24 border-t border-black/5 py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={contact.heroEyebrow} title="Get in Touch" align="center" />
          <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
            <WhatsAppBookButton
              whatsappLink={site.contact.whatsappLink}
              context={{ page: "the About page", intro: "Hi, I have a question." }}
              className="group min-w-0 rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-gold/40"
            >
              <div className="h-full rounded-[1.375rem] bg-cream px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
                  WhatsApp
                </p>
                <p className="mt-3 font-display text-xl font-semibold text-ink">
                  {site.contact.whatsapp}
                </p>
                <p className="mt-1.5 text-sm text-ink-soft/70">{contact.whatsappCardDescription}</p>
              </div>
            </WhatsAppBookButton>

            <a
              href={`mailto:${site.contact.email}`}
              className="group min-w-0 rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-gold/40"
            >
              <div className="h-full rounded-[1.375rem] bg-cream px-6 py-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
                  Email
                </p>
                <p className="mt-3 break-words font-display text-lg font-semibold text-ink sm:text-xl">
                  {site.contact.email}
                </p>
                <p className="mt-1.5 text-sm text-ink-soft/70">{contact.emailCardDescription}</p>
              </div>
            </a>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-dark">Follow Along</p>
            <SocialLinks site={site} tone="light" />
          </div>

          <div className="mt-16">
            <SectionHeading eyebrow={contact.policiesEyebrow} title={contact.policiesTitle} align="center" />
            <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
              <div className="rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06]">
                <div className="h-full rounded-[1.375rem] bg-cream px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <p className="font-display text-lg font-semibold text-ink">Deposit &amp; Payment</p>
                  <p className="mt-2 text-sm text-ink-soft/75">{site.policies.deposit}</p>
                  <p className="mt-2 text-sm text-ink-soft/75">{site.policies.currency}</p>
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06]">
                <div className="h-full rounded-[1.375rem] bg-cream px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <p className="font-display text-lg font-semibold text-ink">Children&rsquo;s Pricing</p>
                  <ul className="mt-2 space-y-1 text-sm text-ink-soft/75">
                    {site.policies.children.map((c) => (
                      <li key={c.age}>
                        <span className="font-medium text-ink">{c.age}:</span> {c.price}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-ink-soft/60">{site.policies.childrenNote}</p>
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06]">
                <div className="h-full rounded-[1.375rem] bg-cream px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <p className="font-display text-lg font-semibold text-ink">Your Voucher</p>
                  <p className="mt-2 text-sm text-ink-soft/75">{site.policies.voucher}</p>
                </div>
              </div>
              <div className="rounded-[1.75rem] bg-sand-deep/45 p-1.5 ring-1 ring-black/[0.06]">
                <div className="h-full rounded-[1.375rem] bg-cream px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <p className="font-display text-lg font-semibold text-ink">Cancellation Policy</p>
                  <p className="mt-2 text-sm text-ink-soft/75">{site.policies.cancellation}</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Closing CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-ink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-12rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-gold/[0.12] blur-3xl"
        />
        <Container className="relative flex flex-col items-center gap-7 py-24 text-center lg:py-32">
          <Rule tone="dark" />
          <h2 className="max-w-3xl text-balance font-display text-3xl font-semibold leading-tight text-cream sm:text-5xl">
            The next name on that list could be yours
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-cream/65">
            Tell us who&rsquo;s travelling, roughly when, and what you actually want to see. We&rsquo;ll
            come back with a real itinerary and a real price — written by the people who&rsquo;ll be
            running your trip.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/customize"
              className="group inline-flex items-center gap-3 rounded-full bg-gold py-2.5 pl-6 pr-2.5 text-sm font-semibold text-ink transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-gold-light active:scale-[0.98]"
            >
              Customize Your Tour
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
            <WhatsAppBookButton
              whatsappLink={site.contact.whatsappLink}
              context={{ page: "the About page" }}
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-cream/85 transition-colors duration-300 hover:border-gold/60 hover:text-gold-light"
            >
              Message Us on WhatsApp
            </WhatsAppBookButton>
          </div>
        </Container>
      </section>
    </>
  );
}
