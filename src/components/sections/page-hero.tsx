import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden border-b border-white/[0.06] pb-14 pt-28 sm:pt-32", className)}>
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-15" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-neon-purple/20 blur-[130px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-neon-magenta/15 blur-[130px]"
        aria-hidden
      />

      <div className="container-fest relative">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="max-w-4xl text-balance font-display text-[clamp(2.1rem,6vw,4.2rem)] font-black leading-[0.98] text-white">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/55 sm:text-lg">{description}</p>
        ) : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </section>
  );
}
