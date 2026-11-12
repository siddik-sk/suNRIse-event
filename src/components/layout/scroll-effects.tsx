"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP ScrollTrigger reveals. Components opt in with data attributes:
 *   data-gsap="fade-up" | "stagger" | "scale" | "hero-parallax"
 * Fully disabled when the user prefers reduced motion.
 */
export function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-gsap="fade-up"]').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 42 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="fade-left"]').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, x: -48 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="scale"]').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, scale: 0.94 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="stagger"]').forEach((container) => {
        const children = Array.from(container.children) as HTMLElement[];
        if (!children.length) return;
        gsap.fromTo(
          children,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: container, start: "top 86%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap="hero-parallax"]').forEach((element) => {
        gsap.to(element, {
          yPercent: 18,
          autoAlpha: 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
          },
        });
      });
    });

    const id = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.cancelAnimationFrame(id);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
