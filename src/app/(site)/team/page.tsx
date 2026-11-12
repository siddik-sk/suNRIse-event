import type { Metadata } from "next";
import { ArrowUpRight, Mail, Users } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Button } from "@/components/ui/button";
import { FEST, TEAM } from "@/lib/fest";

export const metadata: Metadata = {
  title: "The crew",
  description: `Meet the student organizers behind ${FEST.fullName} at ${FEST.college}.`,
  alternates: { canonical: "/team" },
  openGraph: {
    title: `The crew · ${FEST.fullName}`,
    description: "The students who make the grid run.",
    url: "/team",
  },
};

const accentStyles: Record<string, { text: string; border: string; bg: string; hex: string }> = {
  cyan: { text: "text-neon-cyan", border: "border-neon-cyan/30", bg: "bg-neon-cyan/[0.07]", hex: "#00f0ff" },
  magenta: { text: "text-neon-pink", border: "border-neon-magenta/30", bg: "bg-neon-magenta/[0.07]", hex: "#ff2d95" },
  orange: { text: "text-neon-amber", border: "border-neon-orange/30", bg: "bg-neon-orange/[0.07]", hex: "#ff8a00" },
  purple: { text: "text-neon-violet", border: "border-neon-purple/30", bg: "bg-neon-purple/[0.08]", hex: "#8b5cf6" },
  lime: { text: "text-neon-lime", border: "border-neon-lime/25", bg: "bg-neon-lime/[0.06]", hex: "#a3ff12" },
  pink: { text: "text-neon-pink", border: "border-neon-pink/30", bg: "bg-neon-pink/[0.07]", hex: "#ff6ec7" },
  blue: { text: "text-blue-300", border: "border-neon-blue/30", bg: "bg-neon-blue/[0.07]", hex: "#3d7bff" },
  amber: { text: "text-neon-amber", border: "border-neon-amber/30", bg: "bg-neon-amber/[0.07]", hex: "#ffc24b" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function TeamPage() {
  return (
    <>
      <PageHero
        eyebrow="The crew"
        title={
          <>
            Students running the <span className="text-gradient">whole circus.</span>
          </>
        }
        description="Eight core team leads, dozens of volunteers and one shared spreadsheet that should probably be a database. Meet the people who answer the 2 AM messages."
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-cyan">
            <Users className="h-3 w-3" /> {TEAM.length} core leads
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
            100+ volunteers
          </span>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-fest">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {TEAM.map((member, index) => {
              const accent = accentStyles[member.accent] ?? accentStyles.cyan;
              return (
                <article
                  key={member.name}
                  className="neon-frame neon-frame-hover group relative overflow-hidden rounded-2xl p-5"
                >
                  <div
                    className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                    style={{ backgroundColor: accent.hex }}
                    aria-hidden
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid h-14 w-14 place-items-center rounded-2xl border ${accent.border} ${accent.bg} font-display text-lg font-black ${accent.text}`}
                    >
                      {initials(member.name)}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.2em] text-white/20">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-lg font-bold text-white">{member.name}</h2>
                  <p className={`mt-1 font-mono text-[9px] uppercase tracking-[0.18em] ${accent.text}`}>{member.role}</p>
                  <p className="mt-3 border-t border-white/10 pt-3 text-[11px] text-white/40">{member.dept}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Want to volunteer?</p>
              <h2 className="mt-2 font-display text-xl font-bold text-white">Join the crew.</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                We need hands for registration desks, stage management, hospitality, social media and tech support.
                Volunteers get a crew pass, meals and the best view of the fest.
              </p>
              <Button
                href={`mailto:${FEST.email}?subject=Volunteer%20for%20suNRIseevent%2027`}
                size="sm"
                className="mt-4"
                icon={<Mail className="h-3.5 w-3.5" />}
              >
                Volunteer with us
              </Button>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">General queries</p>
              <h2 className="mt-2 font-display text-xl font-bold text-white">Talk to the core team.</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/45">
                Sponsorships, press, accessibility requests or anything else — the inbox is monitored daily in the run
                up to the fest.
              </p>
              <Button href="/contact" size="sm" variant="secondary" className="mt-4" icon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                Contact the team
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
