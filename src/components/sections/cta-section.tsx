import { ArrowRight, ScanLine, Sparkles, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { FEST } from "@/lib/fest";

export function CtaSection() {
  return (
    <section className="relative py-20 md:py-28" aria-labelledby="cta-heading">
      <div className="container-fest">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-ink-900/60 px-6 py-14 text-center backdrop-blur-xl sm:px-12">
          <div className="absolute inset-0 grid-bg opacity-30" aria-hidden />
          <div className="aurora -left-20 -top-20 h-72 w-72 bg-neon-magenta/25" aria-hidden />
          <div className="aurora -bottom-24 -right-16 h-80 w-80 bg-neon-cyan/20" aria-hidden />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent" aria-hidden />

          <div className="relative mx-auto max-w-3xl">
            <p className="eyebrow justify-center">Your pass is waiting</p>
            <h2 id="cta-heading" className="mt-4 text-balance font-display text-4xl font-black leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
              See you on the <span className="text-gradient">grid.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/50 sm:text-base">
              One QR pass. All three days. Choose your events now and add more from your dashboard whenever you
              find something irresistible.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/register" size="lg" icon={<Ticket className="h-4 w-4" />}>
                Register for free
              </Button>
              <Button href="/events" variant="secondary" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Find your event
              </Button>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
              <Countdown compact />
              <span className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden />
              <div className="text-left text-xs text-white/40">
                <p className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-neon-lime" aria-hidden /> Registrations close 15 Feb 2027
                </p>
                <p className="mt-1 flex items-center gap-1.5">
                  <ScanLine className="h-3.5 w-3.5 text-neon-cyan" aria-hidden /> QR pass delivered by email
                </p>
              </div>
            </div>

            <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.25em] text-white/25">
              {FEST.datesLabel} · {FEST.city}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
