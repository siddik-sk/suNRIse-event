"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { FEST } from "@/lib/fest";

type Parts = { days: number; hours: number; minutes: number; seconds: number; live: boolean };

function diffParts(target: number): Parts {
  const delta = target - Date.now();
  if (delta <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, live: true };
  return {
    days: Math.floor(delta / 86_400_000),
    hours: Math.floor((delta / 3_600_000) % 24),
    minutes: Math.floor((delta / 60_000) % 60),
    seconds: Math.floor((delta / 1000) % 60),
    live: false,
  };
}

const initial: Parts = { days: 0, hours: 0, minutes: 0, seconds: 0, live: false };

export function Countdown({ compact = false, className }: { compact?: boolean; className?: string }) {
  const target = useMemo(() => new Date(FEST.startDate).getTime(), []);
  const [parts, setParts] = useState<Parts>(initial);

  useEffect(() => {
    setParts(diffParts(target));
    const timer = window.setInterval(() => setParts(diffParts(target)), 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const cells = [
    { value: parts.days, label: "Days" },
    { value: parts.hours, label: "Hrs" },
    { value: parts.minutes, label: "Min" },
    { value: parts.seconds, label: "Sec" },
  ];

  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", className)} aria-label="Countdown to suNRIseevent '27">
      {cells.map((cell, index) => (
        <div key={cell.label} className="flex items-center gap-2 sm:gap-3">
          <div
            className={cn(
              "flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 backdrop-blur-md",
              compact ? "min-w-[52px]" : "min-w-[66px] px-3 py-2.5 sm:min-w-[76px]",
            )}
          >
            <span
              className={cn(
                "font-mono font-semibold tabular-nums text-white",
                compact ? "text-lg" : "text-2xl sm:text-3xl",
              )}
            >
              {String(cell.value).padStart(2, "0")}
            </span>
            <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.22em] text-white/40 sm:text-[9px]">
              {cell.label}
            </span>
          </div>
          {index < cells.length - 1 ? (
            <span className="font-mono text-lg text-neon-cyan/50" aria-hidden>
              :
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function CountUp({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const [node, setNode] = useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1600;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(value * eased);
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [node, value]);

  return (
    <span ref={setNode} className={className}>
      {prefix}
      {display.toLocaleString("en-IN", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
