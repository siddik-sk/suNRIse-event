import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className, animated = false }: { className?: string; animated?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-10 w-10", className)}
      role="img"
      aria-label="suNRIseevent emblem"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sunrise-mark" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00F0FF" />
          <stop offset="0.45" stopColor="#8B5CF6" />
          <stop offset="0.75" stopColor="#FF2D95" />
          <stop offset="1" stopColor="#FF8A00" />
        </linearGradient>
        <linearGradient id="sunrise-mark-inner" x1="18" y1="18" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF2D95" />
          <stop offset="0.5" stopColor="#C084FC" />
          <stop offset="1" stopColor="#00F0FF" />
        </linearGradient>
        <filter id="sunrise-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="5" y="5" width="54" height="54" rx="16" fill="#080214" stroke="url(#sunrise-mark)" strokeWidth="1.5" />
      <path
        d="M20 44V20L44 44V20"
        stroke="url(#sunrise-mark-inner)"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sunrise-glow)"
        className={animated ? "animate-flicker" : undefined}
      />
      <circle cx="50" cy="14" r="2.4" fill="#A3FF12" />
      <circle cx="14" cy="50" r="1.6" fill="#FF8A00" />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="suNRIseevent '27 home"
    >
      <LogoMark className="h-10 w-10 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-base font-black tracking-[0.06em] text-white transition-colors group-hover:text-neon-cyan sm:text-lg",
            compact && "text-sm sm:text-base",
          )}
        >
          suNRIseevent
        </span>
        <span className="mt-0.5 font-mono text-[8px] tracking-[0.22em] text-neon-cyan/80">
          {compact ? "NRI · VJA" : "FEST ’27 · NRI VJA"}
        </span>
      </span>
    </Link>
  );
}
