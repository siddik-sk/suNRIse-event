"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/three/hero-scene"), {
  ssr: false,
  loading: () => null,
});

function canRunWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function shouldRender3D() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.innerWidth < 900) return false;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (nav.connection?.saveData) return false;
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) return false;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) return false;
  return canRunWebGL();
}

/** 2D fallback used on mobile, reduced-motion and low-power devices. */
function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="aurora left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 bg-neon-purple/30 animate-pulse-glow" />
      <div className="aurora left-[62%] top-[36%] h-56 w-56 bg-neon-magenta/20 animate-drift" />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-[24rem] w-[24rem] sm:h-[32rem] sm:w-[32rem]">
          <div className="absolute inset-0 rounded-full border border-neon-cyan/25" />
          <div className="absolute inset-6 rounded-full border border-dashed border-neon-magenta/25 animate-[spin_52s_linear_infinite]" />
          <div className="absolute inset-14 rounded-full border border-neon-purple/25" />
          <div className="absolute inset-24 rounded-full border border-dashed border-neon-orange/25 animate-[spin_34s_linear_infinite_reverse]" />
          <div
            className="absolute inset-32 rounded-full opacity-50 blur-md animate-[spin_20s_linear_infinite]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(0,240,255,.45) 80deg, transparent 160deg, rgba(255,45,149,.45) 260deg, transparent 340deg)",
            }}
          />

          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan shadow-[0_0_14px_#00f0ff]" />
          <span className="absolute bottom-6 right-[18%] h-1.5 w-1.5 rounded-full bg-neon-magenta shadow-[0_0_12px_#ff2d95]" />
          <span className="absolute left-[12%] top-[58%] h-1.5 w-1.5 rounded-full bg-neon-orange shadow-[0_0_12px_#ff8a00]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Lazy 3D loader. The 2D fallback is always painted first, so LCP never waits on
 * Three.js. The heavy chunk is only requested when the device can handle it.
 */
export function Hero3D() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!shouldRender3D()) return;

    let cancelled = false;
    const start = () => {
      if (!cancelled) setEnabled(true);
    };

    const w = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 1800 }) : window.setTimeout(start, 500);

    return () => {
      cancelled = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <HeroFallback />
      {enabled ? (
        <div className="absolute inset-0 opacity-0 animate-[fade-in_1.2s_ease_.3s_forwards]">
          <HeroScene />
        </div>
      ) : null}

      {/* Readability gradients over the 3D layer. The wordmark is centred, so
          the scrim stays centred too and keeps the ring system visible. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,1,13,.62)_0%,rgba(5,1,13,.3)_45%,rgba(5,1,13,.82)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
    </div>
  );
}
