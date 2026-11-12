import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Sparkles, Ticket } from "lucide-react";
import { Hero3D } from "@/components/three/hero-3d";
import { Countdown } from "@/components/ui/countdown";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { FEST } from "@/lib/fest";

const ticker = [
  "HACKATHONS",
  "ROBOTICS",
  "DESIGN JAMS",
  "LIVE MUSIC",
  "GAMING",
  "WORKSHOPS",
  "STARTUP PITCH",
  "NEON NIGHTS",
];

export function Hero({ eventCount = 47 }: { eventCount?: number }) {
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden pt-24" aria-labelledby="hero-title">
      <Hero3D />

      <div className="container-fest relative z-10 flex flex-1 flex-col items-center justify-center pb-32 pt-8 text-center sm:pt-12 lg:pb-36">
        <div className="flex flex-wrap items-center justify-center gap-2 opacity-0 animate-fade-in [animation-delay:150ms]">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/65 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-neon-lime" aria-hidden />
            {FEST.collegeShort} {FEST.city} presents
          </span>
          <span className="rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.06] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-neon-cyan">
            03 days · 14 departments
          </span>
        </div>

        <h1
          id="hero-title"
          className="relative mt-6 opacity-0 animate-fade-in [animation-delay:300ms] sm:mt-8"
        >
          <span className="sr-only">suNRIseevent 2K27</span>
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-[min(90vw,52rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-950/70 blur-3xl"
          />
          <span
            aria-hidden
            className="relative block font-display text-[clamp(2.5rem,9.4vw,7.5rem)] font-black leading-[0.9] tracking-[-0.05em]"
          >
            <span className="pointer-events-none absolute inset-0 translate-x-[2px] text-neon-cyan/25 blur-[1px]">
              suNRIseevent
            </span>
            <span className="pointer-events-none absolute inset-0 -translate-x-[2px] text-neon-magenta/25 blur-[1px]">
              suNRIseevent
            </span>
            <span className="relative text-white">suNRI</span>
            <span className="relative text-gradient">seevent</span>
          </span>
          <span aria-hidden className="mt-2 flex items-center justify-center gap-3 sm:mt-3 sm:gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-neon-cyan/70 sm:w-16" />
            <span className="font-mono text-[clamp(1rem,2.6vw,1.6rem)] font-medium tracking-[0.4em] text-neon-cyan">
              2K27
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-neon-cyan/70 sm:w-16" />
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-pretty font-display text-lg font-medium leading-snug text-white/85 opacity-0 animate-fade-in [animation-delay:450ms] sm:text-2xl">
          Where Code Meets Carnival.
        </p>
        <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/50 opacity-0 animate-fade-in [animation-delay:550ms] sm:text-base">
          Three electric days of hackathons, battle bots, design sprints, live music and 12,000 people who
          build things. Your campus, but turned all the way up.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/60 opacity-0 animate-fade-in [animation-delay:650ms]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-neon-cyan" aria-hidden />
            {FEST.datesLabel}
          </span>
          <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden />
          <Link
            href="/contact#venue"
            className="inline-flex items-center gap-2 transition hover:text-neon-cyan"
          >
            <MapPin className="h-3.5 w-3.5 text-neon-magenta" aria-hidden />
            {FEST.venue}
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 opacity-0 animate-fade-in [animation-delay:750ms]">
          <Button href="/register" size="lg" icon={<Ticket className="h-4 w-4" />}>
            Grab your pass
          </Button>
          <Button href="/events" variant="secondary" size="lg" icon={<ArrowUpRight className="h-4 w-4" />}>
            Explore {eventCount || 47} events
          </Button>
        </div>

        <div className="mt-10 opacity-0 animate-fade-in [animation-delay:900ms]">
          <p className="mb-2.5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">Fest begins in</p>
          <div className="flex justify-center">
            <Countdown compact />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="flex items-center justify-between border-y border-white/10 bg-ink-950/50 py-3 backdrop-blur-md">
          <div className="relative flex flex-1 overflow-hidden mask-fade-x">
            <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap pr-8">
              {[...ticker, ...ticker, ...ticker, ...ticker].map((item, index) => (
                <span key={`${item}-${index}`} className="flex items-center gap-8">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">{item}</span>
                  <LogoMark className="h-2.5 w-2.5 opacity-50" />
                </span>
              ))}
            </div>
          </div>
          <span className="hidden shrink-0 items-center gap-2 px-6 font-mono text-[9px] uppercase tracking-[0.25em] text-neon-cyan sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-lime" /> Registrations live
          </span>
        </div>
        <div className="container-fest flex justify-center py-5">
          <a
            href="#about"
            className="group inline-flex flex-col items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.28em] text-white/30 transition hover:text-neon-cyan"
          >
            Scroll to explore
            <span className="flex h-8 w-5 items-start justify-center rounded-full border border-white/15 p-1">
              <span className="h-1.5 w-0.5 animate-bounce rounded-full bg-neon-cyan/70" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
