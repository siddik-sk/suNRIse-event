import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Countdown } from "@/components/ui/countdown";
import { FEST } from "@/lib/fest";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" aria-hidden />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-neon-purple/20 blur-[130px]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-neon-magenta/15 blur-[130px]" aria-hidden />

      <div className="relative grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between">
            <Logo compact />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 transition hover:text-neon-cyan"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back home
            </Link>
          </div>

          <main id="main" className="flex flex-1 items-center justify-center py-12">
            <div className="w-full max-w-xl">{children}</div>
          </main>

          <p className="text-center font-mono text-[9px] uppercase tracking-[0.25em] text-white/20">
            {FEST.datesLabel} · {FEST.collegeShort} Vijayawada
          </p>
        </div>

        <aside className="relative hidden overflow-hidden border-l border-white/10 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/20 via-ink-900 to-neon-magenta/10" aria-hidden />
          <div className="absolute inset-0 grid-bg opacity-25" aria-hidden />
          <div className="absolute -right-20 top-1/4 h-80 w-80 rounded-full border border-neon-cyan/20" aria-hidden />
          <div className="absolute -right-6 top-1/4 h-52 w-52 rounded-full border border-dashed border-neon-magenta/25" aria-hidden />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 backdrop-blur">
              <Sparkles className="h-3 w-3 text-neon-lime" /> {FEST.fullName}
            </span>
          </div>

          <div className="relative">
            <p className="font-display text-4xl font-black leading-[1.02] text-white xl:text-5xl">
              One pass.
              <br />
              Three days of
              <br />
              <span className="text-gradient">pure signal.</span>
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">
              Hackathons, robots, design sprints and a main stage that refuses to go quiet. Your QR pass gets
              you into all of it.
            </p>
            <div className="mt-8">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">Fest begins in</p>
              <Countdown compact />
            </div>
          </div>

          <div className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              { value: "60+", label: "Events" },
              { value: "14", label: "Departments" },
              { value: "₹8L", label: "Prizes" },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-display text-xl font-bold text-white">{item.value}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">{item.label}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
