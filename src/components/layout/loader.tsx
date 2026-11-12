"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogoMark } from "@/components/ui/logo";

/** CSS-3D gyroscope around the emblem. Light enough for the first paint. */
function IntroRings() {
  return (
    <div className="relative h-40 w-40 [perspective:720px] sm:h-48 sm:w-48" aria-hidden>
      <div className="absolute inset-0 animate-[gyro-a_9s_linear_infinite] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-full border border-neon-cyan/60 shadow-[0_0_45px_rgba(0,240,255,0.22)]" />
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan shadow-[0_0_14px_#00f0ff]" />
      </div>
      <div className="absolute inset-0 animate-[gyro-b_12s_linear_infinite] [transform-style:preserve-3d]">
        <div className="absolute inset-2 rounded-full border border-neon-magenta/55 shadow-[0_0_40px_rgba(255,45,149,0.2)]" />
        <span className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-magenta shadow-[0_0_12px_#ff2d95]" />
      </div>
      <div className="absolute inset-0 animate-[gyro-c_15s_linear_infinite] [transform-style:preserve-3d]">
        <div className="absolute inset-4 rounded-full border border-dashed border-neon-purple/60" />
        <span className="absolute left-1/2 top-4 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-violet shadow-[0_0_12px_#c084fc]" />
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white/[0.05] backdrop-blur-md sm:h-20 sm:w-20">
          <LogoMark className="h-10 w-10 sm:h-12 sm:w-12" animated />
        </div>
      </div>
    </div>
  );
}

/**
 * First-visit loading overlay. Skipped for reduced-motion users and on repeat
 * navigations within the same tab (sessionStorage).
 */
export function Loader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setVisible(false);
      return;
    }

    try {
      if (window.sessionStorage.getItem("neo:loaded") === "1") {
        setVisible(false);
        return;
      }
    } catch {
      /* storage may be blocked */
    }

    document.documentElement.style.overflow = "hidden";
    let value = 8;
    const tick = window.setInterval(() => {
      value = Math.min(100, value + Math.random() * 16 + 5);
      setProgress(Math.floor(value));
      if (value >= 100) {
        window.clearInterval(tick);
        window.setTimeout(() => {
          setVisible(false);
          document.documentElement.style.overflow = "";
          try {
            window.sessionStorage.setItem("neo:loaded", "1");
          } catch {
            /* ignore */
          }
        }, 320);
      }
    }, 130);

    return () => {
      window.clearInterval(tick);
      document.documentElement.style.overflow = "";
    };
  }, [reduce]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[250] flex flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 text-center"
          role="status"
          aria-label="Loading suNRIseevent"
        >
          <div className="absolute inset-0 grid-bg opacity-20" aria-hidden />
          <div className="aurora left-1/3 top-1/3 h-72 w-72 bg-neon-purple/40" aria-hidden />
          <div className="aurora right-1/4 bottom-1/4 h-64 w-64 bg-neon-magenta/30" aria-hidden />

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative flex flex-col items-center"
          >
            <IntroRings />

            <p className="mt-7 font-mono text-[9px] uppercase tracking-[0.45em] text-neon-cyan/70 sm:text-[10px]">
              NRI University · Agiripalli
            </p>

            <p className="mt-3 font-display text-[clamp(2rem,7.5vw,4rem)] font-black leading-none tracking-[-0.04em] text-white">
              suNRI<span className="text-gradient">seevent</span>
            </p>

            <div className="mt-3 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-neon-cyan/60" />
              <span className="font-mono text-xs tracking-[0.45em] text-neon-cyan sm:text-sm">2K27</span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-neon-cyan/60" />
            </div>

            <div className="mt-8 h-[2px] w-64 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-fest-gradient transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2.5 flex w-64 items-center justify-between font-mono text-[9px] tracking-[0.2em] text-white/35">
              <span>19–21 FEB 2027</span>
              <span>{String(progress).padStart(3, "0")}%</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
