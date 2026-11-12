import { ArrowUpRight, Handshake } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { SPONSORS } from "@/lib/fest";

function SponsorLogo({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-4 transition hover:border-white/25 hover:bg-white/[0.05]">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 14px ${color}` }} aria-hidden />
      <span className="whitespace-nowrap font-display text-sm font-bold tracking-[0.18em] text-white/70">{name}</span>
    </div>
  );
}

export function SponsorsSection() {
  const row = [...SPONSORS, ...SPONSORS];
  return (
    <section className="relative overflow-hidden section-pad" aria-labelledby="sponsors-heading">
      <div className="container-fest">
        <div data-gsap="fade-up">
          <SectionHeading
            eyebrow="Backed by builders"
            title={<span id="sponsors-heading">The people who keep the lights neon.</span>}
            description="An independent, student-run festival made possible by brands that believe in what students can build."
            action={
              <Button href="/sponsors" variant="secondary" icon={<ArrowUpRight className="h-4 w-4" />}>
                All sponsors
              </Button>
            }
          />
        </div>
      </div>

      <div className="relative mt-14 space-y-3">
        <div className="mask-fade-x overflow-hidden">
          <div className="flex w-max animate-marquee gap-3 pr-3 hover:[animation-play-state:paused]">
            {row.map((sponsor, index) => (
              <SponsorLogo key={`${sponsor.name}-${index}`} name={sponsor.name} color={sponsor.color} />
            ))}
          </div>
        </div>
        <div className="mask-fade-x overflow-hidden">
          <div className="flex w-max animate-marquee-reverse gap-3 pr-3 hover:[animation-play-state:paused]">
            {[...row].reverse().map((sponsor, index) => (
              <SponsorLogo key={`${sponsor.name}-r-${index}`} name={sponsor.name} color={sponsor.color} />
            ))}
          </div>
        </div>
      </div>

      <div className="container-fest mt-12">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-neon-orange/10">
              <Handshake className="h-5 w-5 text-neon-amber" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Want your brand in front of 12,000 students?</p>
              <p className="text-xs text-white/40">Sponsorship decks and custom activations available.</p>
            </div>
          </div>
          <Button href="/contact?topic=sponsorship" variant="outline" size="sm">
            Talk to us
          </Button>
        </div>
      </div>
    </section>
  );
}
