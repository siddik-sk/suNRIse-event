"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { GALLERY } from "@/lib/fest";
import { cn } from "@/lib/utils";

const hex: Record<string, string> = {
  cyan: "#00f0ff",
  magenta: "#ff2d95",
  orange: "#ff8a00",
  purple: "#8b5cf6",
  lime: "#a3ff12",
};

type GalleryItem = (typeof GALLERY)[number];

function Art({ item, large = false }: { item: GalleryItem; large?: boolean }) {
  const color = hex[item.accent] ?? "#00f0ff";
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5"
      style={{
        background: `radial-gradient(120% 120% at 80% 10%, ${color}55 0%, #0b0418 55%, #05010d 100%)`,
      }}
    >
      <div className="absolute inset-0 grid-bg-sm opacity-40" aria-hidden />
      <div className="absolute -right-10 top-1/3 h-32 w-32 rounded-full border" style={{ borderColor: `${color}66` }} aria-hidden />
      <div className="absolute -right-4 top-1/3 h-20 w-20 rounded-full border border-dashed" style={{ borderColor: `${color}44` }} aria-hidden />
      <div className="absolute left-8 top-1/2 h-32 w-32 rotate-45 border" style={{ borderColor: `${color}33` }} aria-hidden />
      <div
        className="absolute bottom-0 left-0 h-1/2 w-full opacity-25"
        style={{ background: `linear-gradient(to top, ${color}, transparent)` }}
        aria-hidden
      />

      <div className="relative flex items-start justify-between">
        <span className="rounded-full border border-white/20 bg-black/20 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/60 backdrop-blur">
          {item.tag}
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">{item.year}</span>
      </div>

      <div className="relative">
        <p className={cn("font-display font-black leading-[0.9] tracking-tight text-white", large ? "text-5xl sm:text-6xl" : "text-2xl sm:text-3xl")}>
          {item.title}
        </p>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.24em]" style={{ color }}>
          suNRIseevent archive
        </p>
      </div>
    </div>
  );
}

export function Gallery() {
  const [active, setActive] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [active]);

  return (
    <section id="gallery" className="relative section-pad" aria-labelledby="gallery-heading">
      <div className="container-fest">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end" data-gsap="fade-up">
          <SectionHeading
            eyebrow="Aftermovie, but frozen"
            title={<span id="gallery-heading">Scenes from the last time we did this.</span>}
            description="Hackathon sunrise, robo sparks, the main stage at 10pm. The 2027 archive starts in February."
          />
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">
            2025 — 2026 archive
          </p>
        </div>

        <div className="mt-12 grid auto-rows-[190px] grid-cols-2 gap-3 sm:auto-rows-[220px] lg:grid-cols-4" data-gsap="scale">
          {GALLERY.map((item, index) => (
            <motion.button
              key={item.title}
              type="button"
              onClick={() => setActive(item)}
              whileHover={{ scale: 1.015 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-white/10 text-left focus-visible:ring-2 focus-visible:ring-neon-cyan",
                index === 0 ? "col-span-2 row-span-2" : "",
              )}
              aria-label={`View ${item.title} from ${item.year}`}
            >
              <Art item={item} large={index === 0} />
              <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/30 text-white/60 opacity-0 backdrop-blur transition group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[220] grid place-items-center bg-ink-950/90 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.title} gallery view`}
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="relative aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20"
              onClick={(event) => event.stopPropagation()}
            >
              <Art item={active} large />
              <button
                type="button"
                autoFocus
                onClick={() => setActive(null)}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Close gallery view"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">{active.tag} · {active.year}</p>
                <p className="mt-1 text-sm text-white/60">Replace this CSS artwork with official fest photography.</p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
