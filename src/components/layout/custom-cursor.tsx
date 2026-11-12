"use client";

import { useEffect, useRef } from "react";

/**
 * Neon custom cursor. Only activates on fine pointers and when the user has not
 * requested reduced motion. Native cursor is kept for text fields.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;
    let hovering = false;

    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      const target = event.target as HTMLElement | null;
      const interactive = Boolean(target?.closest("a, button, input, textarea, select, [role='button'], [data-cursor]"));
      if (interactive !== hovering) {
        hovering = interactive;
        ring.style.width = hovering ? "56px" : "34px";
        ring.style.height = hovering ? "56px" : "34px";
        ring.style.borderColor = hovering ? "rgba(255,45,149,.9)" : "rgba(0,240,255,.55)";
        ring.style.backgroundColor = hovering ? "rgba(255,45,149,.08)" : "transparent";
      }
    };

    const onDown = () => {
      ring.style.width = "24px";
      ring.style.height = "24px";
    };
    const onUp = () => {
      ring.style.width = hovering ? "56px" : "34px";
      ring.style.height = hovering ? "56px" : "34px";
    };
    const onLeave = () => {
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[300] hidden md:block">
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-white opacity-0 transition-opacity"
        style={{ boxShadow: "0 0 10px #fff" }}
      />
      <div
        ref={ringRef}
        className="fixed left-0 top-0 rounded-full border border-neon-cyan/60 opacity-0 transition-[width,height,background-color,border-color,opacity] duration-200"
        style={{ boxShadow: "0 0 20px rgba(0,240,255,.25)" }}
      />
    </div>
  );
}
