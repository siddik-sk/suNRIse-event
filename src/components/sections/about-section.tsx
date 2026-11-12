import Link from "next/link";
import { ArrowUpRight, Check, Code2, Cpu, Radio, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { CountUp } from "@/components/ui/countdown";
import { Reveal } from "@/components/ui/reveal";
import { FEST } from "@/lib/fest";

const stats: { value: number; prefix?: string; suffix: string; label: string; accent: string }[] = [
  { value: 12, suffix: "K+", label: "Footfall", accent: "text-neon-cyan" },
  { value: 60, suffix: "+", label: "Events", accent: "text-neon-pink" },
  { value: 40, suffix: "+", label: "Colleges", accent: "text-neon-amber" },
  { value: 8, prefix: "₹", suffix: "L", label: "Prize pool", accent: "text-neon-lime" },
];

const pillars = [
  { icon: Code2, title: "Build", text: "Hackathons, CTFs and code sprints that ship before the sun comes up." },
  { icon: Cpu, title: "Break", text: "Robots, circuits and hardware labs where things spark — on purpose." },
  { icon: Sparkles, title: "Celebrate", text: "Live music, design shows and a campus-wide neon carnival." },
];

export function AboutSection() {
  return (
    <section id="about" className="relative section-pad" aria-labelledby="about-heading">
      <div className="container-fest">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div data-gsap="fade-up">
            <SectionHeading
              eyebrow="About the festival"
              title={
                <span id="about-heading">
                  A three-day collision of <span className="text-gradient-warm">code, circuits</span> and culture.
                </span>
              }
              description={`${FEST.fullName} is the annual inter-college techno-cultural festival of ${FEST.college}, ${FEST.city}. What started as a single-day coding contest is now a 12,000-person playground for students who make things.`}
            />

            <div className="mt-8 space-y-4">
              {pillars.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-3.5">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-neon-cyan/20 bg-neon-cyan/[0.05]">
                    <Icon className="h-4 w-4 text-neon-cyan" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-white/45">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-neon-cyan hover:text-white"
              >
                See what&apos;s on <ArrowUpRight className="h-4 w-4" />
              </Link>
              <span className="text-white/15" aria-hidden>·</span>
              <span className="text-xs text-white/35">Organised entirely by students.</span>
            </div>
          </div>

          <Reveal delay={0.1} className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-neon-cyan/10 via-transparent to-neon-magenta/10 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/80 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-neon-magenta/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-neon-amber/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-neon-lime/70" />
                </div>
                <span className="font-mono text-[10px] text-white/30">sunriseevent@grid: ~/fest</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-neon-lime/80">live</span>
              </div>

              <div className="space-y-3 p-5 font-mono text-[11px] leading-relaxed sm:text-xs">
                <p className="text-white/30">$ cat festival.config.ts</p>
                <p>
                  <span className="text-neon-purple">export const</span> <span className="text-neon-cyan">fest</span> = {"{"}
                </p>
                <p className="pl-4">
                  name: <span className="text-neon-amber">&quot;suNRIseevent ’27&quot;</span>,
                </p>
                <p className="pl-4">
                  dates: <span className="text-neon-amber">&quot;19—21 Feb 2027&quot;</span>,
                </p>
                <p className="pl-4">
                  city: <span className="text-neon-amber">&quot;Vijayawada&quot;</span>,
                </p>
                <p className="pl-4">
                  departments: <span className="text-neon-lime">14</span>,
                </p>
                <p className="pl-4">
                  events: <span className="text-neon-lime">47</span>,
                </p>
                <p className="pl-4">
                  energy: <span className="text-neon-pink">&quot;unlimited&quot;</span>,
                </p>
                <p>{"}"};</p>
                <p className="text-white/30">
                  $ <span className="text-white/60">deploy --vibe neon --mode carnival</span>
                  <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-neon-cyan align-middle" />
                </p>
              </div>

              <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/10">
                {[
                  { icon: Radio, label: "Main stage", value: "3 nights" },
                  { icon: Code2, label: "Hackathon", value: "24 hours" },
                  { icon: Cpu, label: "Robo arena", value: "8 kg class" },
                  { icon: Sparkles, label: "Prize pool", value: "₹8,00,000" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 bg-ink-900/90 px-4 py-3">
                    <Icon className="h-4 w-4 text-neon-cyan/70" aria-hidden />
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-white/30">{label}</p>
                      <p className="text-xs font-semibold text-white/75">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden items-center gap-2 rounded-2xl border border-neon-lime/25 bg-ink-900/95 px-4 py-3 shadow-xl backdrop-blur sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-neon-lime/10">
                <Check className="h-4 w-4 text-neon-lime" aria-hidden />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-white">Open to all colleges</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/35">NRI + guest campuses</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-8 border-y border-white/10 py-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left" data-gsap="fade-up">
              <p className={`font-display text-4xl font-black tracking-tight md:text-5xl ${stat.accent}`}>
                <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
