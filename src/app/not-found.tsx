import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Compass, Ticket } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { FEST } from "@/lib/fest";

export const metadata: Metadata = {
  title: "Page not found",
  description: `That link drifted off the grid. Head back to ${FEST.fullName}.`,
  robots: { index: false, follow: false },
};

const suggestions = [
  {
    href: "/events",
    label: "All events",
    hint: "60+ competitions and showcases",
    Icon: Compass,
  },
  {
    href: "/schedule",
    label: "Schedule",
    hint: `${FEST.datesLabel} · three days`,
    Icon: CalendarDays,
  },
  {
    href: "/register",
    label: "Register",
    hint: "Claim your spot before 15 Feb",
    Icon: Ticket,
  },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.12]" aria-hidden />
        <div
          className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-neon-purple/20 blur-[130px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-neon-magenta/15 blur-[130px]"
          aria-hidden
        />

        <div className="container-fest relative">
          <p className="eyebrow mb-5">Error 404</p>

          <p className="select-none font-display text-[clamp(4.5rem,18vw,11rem)] font-black leading-[0.8]">
            <span className="text-gradient">404</span>
          </p>

          <h1 className="mt-6 max-w-2xl text-balance font-display text-[clamp(1.9rem,5vw,3.4rem)] font-black leading-[1.02] text-white">
            This page slipped off the grid.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/55 sm:text-lg">
            The link may be outdated, mistyped, or the page has packed up for the fest. Nothing is broken — you just
            took a wrong turn somewhere near the main stage.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/" icon={<ArrowLeft className="h-4 w-4" aria-hidden />}>
              Back to home
            </Button>
            <Button href="/contact" variant="secondary">
              Report a broken link
            </Button>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {suggestions.map(({ href, label, hint, Icon }) => (
              <Link
                key={href}
                href={href}
                className="glass neon-frame-hover group rounded-2xl p-5 transition-colors"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neon-cyan/30 bg-neon-cyan/[0.06] text-neon-cyan transition group-hover:border-neon-cyan/60 group-hover:bg-neon-cyan/10">
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <span className="mt-4 block font-display text-base font-bold text-white group-hover:text-neon-cyan">
                  {label}
                </span>
                <span className="mt-1 block text-sm text-white/50">{hint}</span>
              </Link>
            ))}
          </div>

          <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">
            {FEST.fullName} · {FEST.college} · {FEST.city}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
