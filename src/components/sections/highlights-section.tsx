import { Bot, Code2, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import { SectionHeading, Badge } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { HIGHLIGHTS } from "@/lib/fest";

const icons: Record<string, LucideIcon> = { code: Code2, bot: Bot, sparkles: Sparkles, trophy: Trophy };

const styles: Record<string, { border: string; glow: string; text: string; bg: string }> = {
  cyan: { border: "border-neon-cyan/25", glow: "group-hover:shadow-neon-cyan", text: "text-neon-cyan", bg: "from-neon-cyan/15" },
  magenta: { border: "border-neon-magenta/25", glow: "group-hover:shadow-neon-pink", text: "text-neon-pink", bg: "from-neon-magenta/15" },
  orange: { border: "border-neon-orange/25", glow: "group-hover:shadow-neon-orange", text: "text-neon-amber", bg: "from-neon-orange/15" },
  purple: { border: "border-neon-purple/30", glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,.3)]", text: "text-neon-violet", bg: "from-neon-purple/20" },
};

export function HighlightsSection() {
  return (
    <section className="relative section-pad" aria-labelledby="highlights-heading">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-neon-purple/10 blur-[120px]" aria-hidden />
      <div className="container-fest relative">
        <div data-gsap="fade-up">
          <SectionHeading
            eyebrow="Why you’re here"
            title={<span id="highlights-heading">Four reasons this isn’t a normal college fest.</span>}
            description="Built around making, not just watching. Every track ends with something you can demo, race or perform."
            action={
              <Badge tone="lime">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-lime" /> Registrations live
              </Badge>
            }
          />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item, index) => {
            const Icon = icons[item.icon] ?? Sparkles;
            const style = styles[item.accent] ?? styles.cyan;
            return (
              <Reveal key={item.title} delay={index * 0.06}>
                <article
                  className={`group relative h-full overflow-hidden rounded-2xl border ${style.border} bg-ink-900/60 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 ${style.glow}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${style.bg} to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`} aria-hidden />
                  <div className="relative flex items-start justify-between">
                    <span className={`grid h-11 w-11 place-items-center rounded-xl border ${style.border} bg-white/[0.03]`}>
                      <Icon className={`h-5 w-5 ${style.text}`} aria-hidden />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-white/20">0{index + 1}</span>
                  </div>
                  <h3 className="relative mt-8 font-display text-lg font-bold text-white">{item.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/45">{item.text}</p>
                  <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-white/50 to-transparent transition-all duration-500 group-hover:w-full" aria-hidden />
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
