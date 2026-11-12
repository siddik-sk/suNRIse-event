import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Brain,
  Briefcase,
  Building2,
  Code2,
  Cpu,
  Database,
  Dna,
  Network,
  Palette,
  PenTool,
  Radio,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { TiltCard } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import type { PublicDepartment } from "@/lib/data";

const iconMap: Record<string, LucideIcon> = {
  terminal: Terminal,
  brain: Brain,
  palette: Palette,
  bot: Bot,
  database: Database,
  network: Network,
  radio: Radio,
  zap: Zap,
  cog: Cpu,
  building: Building2,
  briefcase: Briefcase,
  code: Code2,
  dna: Dna,
  pen: PenTool,
  cpu: Cpu,
};

const accents: Record<string, { hex: string; text: string; bg: string; border: string }> = {
  cyan: { hex: "#00f0ff", text: "text-neon-cyan", bg: "from-neon-cyan/20 to-transparent", border: "border-neon-cyan/30" },
  magenta: { hex: "#ff2d95", text: "text-neon-pink", bg: "from-neon-magenta/20 to-transparent", border: "border-neon-magenta/30" },
  purple: { hex: "#8b5cf6", text: "text-neon-violet", bg: "from-neon-purple/25 to-transparent", border: "border-neon-purple/30" },
  orange: { hex: "#ff8a00", text: "text-neon-amber", bg: "from-neon-orange/20 to-transparent", border: "border-neon-orange/30" },
  lime: { hex: "#a3ff12", text: "text-neon-lime", bg: "from-neon-lime/15 to-transparent", border: "border-neon-lime/25" },
  blue: { hex: "#3d7bff", text: "text-blue-300", bg: "from-neon-blue/20 to-transparent", border: "border-neon-blue/30" },
  pink: { hex: "#ff6ec7", text: "text-neon-pink", bg: "from-neon-pink/20 to-transparent", border: "border-neon-pink/30" },
  amber: { hex: "#ffc24b", text: "text-neon-amber", bg: "from-neon-amber/20 to-transparent", border: "border-neon-amber/30" },
};

export function DepartmentCard({
  department,
  index = 0,
  className,
}: {
  department: PublicDepartment;
  index?: number;
  className?: string;
}) {
  const Icon = iconMap[department.icon] ?? Cpu;
  const accent = accents[department.accent] ?? accents.cyan;
  const count = department._count?.events ?? 0;

  return (
    <TiltCard className={cn("h-full", className)} accent={department.accent}>
      <Link
        href={`/departments/${department.slug}`}
        className="neon-frame neon-frame-hover group relative flex h-full min-h-[230px] flex-col overflow-hidden rounded-2xl p-6"
      >
        <div
          className="absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: accent.hex }}
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-7 right-2 select-none font-display text-[5.2rem] font-black leading-none tracking-tighter text-white/[0.035] transition-colors duration-500 group-hover:text-white/[0.06]"
          aria-hidden
        >
          {department.shortName}
        </span>

        <div className="flex items-start justify-between">
          <span
            className={cn(
              "grid h-12 w-12 place-items-center rounded-xl border bg-gradient-to-br",
              accent.bg,
              accent.border,
            )}
          >
            <Icon className={cn("h-5 w-5", accent.text)} aria-hidden />
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-white/25">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="relative mt-5">
          <Badge tone="neutral" className="mb-2.5">
            {department.shortName} · {count} events
          </Badge>
          <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-white">
            {department.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/45">
            {department.tagline || department.description}
          </p>
        </div>

        <span className="relative mt-auto inline-flex items-center gap-1 pt-5 text-xs font-semibold text-white/45 transition group-hover:text-neon-cyan">
          Explore events
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </Link>
    </TiltCard>
  );
}
