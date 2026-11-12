import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, HeartHandshake, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { FEST } from "@/lib/fest";

export const metadata: Metadata = {
  title: "Code of conduct",
  description: `The expected behaviour and reporting process for everyone attending ${FEST.fullName}.`,
  alternates: { canonical: "/code-of-conduct" },
};

const expected = [
  "Treat every participant, volunteer, judge and staff member with respect — regardless of college, department, gender, identity, disability, religion or experience level.",
  "Compete honestly. All code, designs and prototypes must be created during the event unless the event rules explicitly allow otherwise.",
  "Respect the venue. Do not damage property, block fire exits or interfere with equipment that is not yours.",
  "Keep it safe. Follow safety briefings for robotics, electrical, drone and wet-lab events. Ask a coordinator if you are unsure.",
  "Protect privacy. Do not photograph or record anyone without their consent, and never publish another student's personal details.",
  "Follow reasonable instructions from fest staff and campus security.",
];

const unacceptable = [
  "Harassment, intimidation, stalking, unwanted photography or sexual attention of any kind.",
  "Discriminatory language or behaviour, including jokes that target a protected group.",
  "Physical violence, threats, or encouraging others to act violently.",
  "Deliberately disrupting talks, competitions, performances or the operations of the fest.",
  "Tampering with networks, devices or infrastructure outside the sanctioned competition environment.",
  "Bringing weapons, illegal substances, fireworks, or anything that violates campus rules.",
];

export default function CodeOfConductPage() {
  return (
    <>
      <PageHero
        eyebrow="Community standards"
        title={
          <>
            Loud celebration. <span className="text-gradient">Zero tolerance.</span>
          </>
        }
        description={`${FEST.fullName} is open to everyone. That only works when everyone agrees to the same basic standards of decency and care.`}
      />

      <section className="section-pad">
        <div className="container-fest max-w-4xl space-y-6">
          <div className="neon-frame rounded-2xl p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-neon-lime">
              <HeartHandshake className="h-4 w-4" /> The short version
            </p>
            <p className="mt-3 text-base leading-relaxed text-white/65">
              Be decent. Compete fair. Keep people safe. If someone tells you to stop, stop. If you see something wrong,
              report it — you will be believed, and you will not be punished for reporting in good faith.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-white">What we expect</h2>
            <ul className="mt-4 space-y-3">
              {expected.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/60">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neon-magenta/20 bg-neon-magenta/[0.04] p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-white">What is not acceptable</h2>
            <ul className="mt-4 space-y-3">
              {unacceptable.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-white/60">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-neon-pink" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-white">Reporting an incident</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/60">
              <p>
                During the fest, approach any coordinator, volunteer or the help desk at the main gate. If you would
                rather not speak in person, email{" "}
                <a href={`mailto:${FEST.email}`} className="text-neon-cyan hover:underline">
                  {FEST.email}
                </a>{" "}
                or call{" "}
                <a href={`tel:${FEST.phone.replace(/[^\d+]/g, "")}`} className="text-neon-cyan hover:underline">
                  {FEST.phone}
                </a>
                .
              </p>
              <p>
                Reports are handled confidentially by the core team and the university&apos;s student welfare office. We will
                explain the next steps, offer support, and take interim measures to keep you safe while the report is
                reviewed.
              </p>
              <p>
                Consequences can include a warning, removal from an event, loss of the fest pass, disqualification, or
                referral to campus authorities — depending on severity.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/contact"
                className="inline-flex h-9 items-center rounded-full bg-fest-gradient px-4 text-xs font-semibold text-white"
              >
                Contact the team
              </Link>
              <Link
                href="/faq"
                className="inline-flex h-9 items-center rounded-full border border-white/15 px-4 text-xs font-semibold text-white/70 hover:border-neon-cyan/40 hover:text-white"
              >
                Read the FAQ
              </Link>
            </div>
          </div>

          <p className="text-center font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">
            Last updated for {FEST.fullName} · {FEST.datesLabel}
          </p>
        </div>
      </section>
    </>
  );
}
