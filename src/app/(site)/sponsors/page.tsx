import type { Metadata } from "next";
import { ArrowUpRight, Handshake, Mail, Sparkles } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Button } from "@/components/ui/button";
import { FEST, SPONSORS } from "@/lib/fest";

export const metadata: Metadata = {
  title: "Sponsors & partners",
  description: `The partners powering ${FEST.fullName} at ${FEST.college}, ${FEST.city}.`,
  alternates: { canonical: "/sponsors" },
  openGraph: {
    title: `Sponsors · ${FEST.fullName}`,
    description: "The brands and builders powering the grid.",
    url: "/sponsors",
  },
};

const TIER_ORDER = [
  "Title Partner",
  "Powered by",
  "Cloud Partner",
  "Innovation Partner",
  "Mobility Partner",
  "Beverage Partner",
  "Audio Partner",
  "Connectivity Partner",
];

export default function SponsorsPage() {
  const tiers = TIER_ORDER.map((tier) => ({
    tier,
    sponsors: SPONSORS.filter((sponsor) => sponsor.tier === tier),
  })).filter((group) => group.sponsors.length > 0);

  return (
    <>
      <PageHero
        eyebrow="The coalition"
        title={
          <>
            Powered by people who <span className="text-gradient">build things.</span>
          </>
        }
        description="A festival this loud does not run on goodwill alone. These partners put real resources behind student ideas — and we make sure everyone knows it."
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-cyan">
            <Handshake className="h-3 w-3" /> {SPONSORS.length} partners
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
            <Sparkles className="h-3 w-3 text-neon-amber" /> 12K+ footfall
          </span>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-fest space-y-10">
          {tiers.map((group, groupIndex) => (
            <div key={group.tier}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">{group.tier}</span>
                <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
              </div>
              <div className={`mt-4 grid gap-4 ${groupIndex === 0 ? "sm:grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
                {group.sponsors.map((sponsor) => (
                  <div
                    key={sponsor.name}
                    className="neon-frame neon-frame-hover group relative overflow-hidden rounded-2xl p-6"
                    style={{ borderColor: `${sponsor.color}44` }}
                  >
                    <div
                      className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                      style={{ backgroundColor: sponsor.color }}
                      aria-hidden
                    />
                    <p
                      className="font-display text-xl font-black tracking-[0.08em] sm:text-2xl"
                      style={{ color: sponsor.color }}
                    >
                      {sponsor.name}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{sponsor.tier}</p>
                    <p className="mt-4 text-xs leading-relaxed text-white/45">
                      Supporting student-led technology, culture and the next generation of builders at {FEST.college}.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="neon-frame relative overflow-hidden rounded-2xl p-7 sm:p-10">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-15" aria-hidden />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <p className="eyebrow mb-3">Partner with us</p>
                <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
                  Put your brand in front of 12,000 students.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  Sponsorship decks, custom activations, hackathon tracks and on-ground stalls — we will build a package
                  around your goals. Reach out and we will send the full deck.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button href={`mailto:${FEST.email}?subject=Sponsorship%20enquiry%20—%20suNRIseevent%2027`} icon={<Mail className="h-4 w-4" />}>
                  Email the team
                </Button>
                <Button href="/contact" variant="secondary" icon={<ArrowUpRight className="h-4 w-4" />}>
                  Contact form
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
