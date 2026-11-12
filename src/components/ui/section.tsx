import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        action && "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h2 className="text-balance text-3xl font-extrabold leading-[1.08] text-white sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-pretty text-base leading-relaxed text-white/55 md:text-lg">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const badgeTones = {
  cyan: "border-neon-cyan/30 bg-neon-cyan/[0.08] text-neon-cyan",
  magenta: "border-neon-magenta/30 bg-neon-magenta/[0.08] text-neon-pink",
  orange: "border-neon-orange/30 bg-neon-orange/[0.08] text-neon-amber",
  purple: "border-neon-purple/30 bg-neon-purple/[0.1] text-neon-violet",
  lime: "border-neon-lime/30 bg-neon-lime/[0.07] text-neon-lime",
  blue: "border-neon-blue/30 bg-neon-blue/[0.08] text-blue-300",
  pink: "border-neon-pink/30 bg-neon-pink/[0.08] text-neon-pink",
  amber: "border-neon-amber/30 bg-neon-amber/[0.08] text-neon-amber",
  neutral: "border-white/15 bg-white/[0.05] text-white/60",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em]",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Stat({ value, label, accent = "cyan" }: { value: string; label: string; accent?: string }) {
  return (
    <div className="group relative">
      <div
        className={cn(
          "font-display text-3xl font-black tracking-tight md:text-4xl",
          accent === "cyan" && "text-neon-cyan",
          accent === "magenta" && "text-neon-pink",
          accent === "orange" && "text-neon-amber",
          accent === "purple" && "text-neon-violet",
        )}
      >
        {value}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("divider-neon", className)} />;
}
