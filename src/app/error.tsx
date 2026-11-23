"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary. Catches render/data errors below the root layout
 * so a single broken section cannot blank the whole festival site.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the browser console / logging pipeline.
    console.error("[suNRIseevent] route error:", error);
  }, [error]);

  return (
    <main id="main" className="relative flex min-h-screen items-center overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.12]" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-neon-magenta/15 blur-[130px]"
        aria-hidden
      />

      <div className="container-fest relative">
        <div className="glass neon-frame mx-auto max-w-2xl rounded-3xl p-8 text-center sm:p-12">
          <p className="eyebrow justify-center">Something short-circuited</p>

          <h1 className="mt-5 text-balance font-display text-[clamp(1.8rem,5vw,3rem)] font-black leading-[1.03] text-white">
            The stage lights flickered.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-white/55">
            A part of this page failed to load. Your registration and pass data are safe — try again, or head back
            home while we reset the scene.
          </p>

          {error.digest ? (
            <p className="mt-5 inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] tracking-wide text-white/45">
              ref {error.digest}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset} icon={<RefreshCw className="h-4 w-4" aria-hidden />}>
              Try again
            </Button>
            <Button href="/" variant="secondary" icon={<Home className="h-4 w-4" aria-hidden />}>
              Home
            </Button>
            <Button href="/contact" variant="ghost" icon={<LifeBuoy className="h-4 w-4" aria-hidden />}>
              Get help
            </Button>
          </div>

          <p className="mt-8 text-xs text-white/35">
            Still stuck?{" "}
            <Link
              href="/contact"
              className="text-neon-cyan underline underline-offset-4 transition-colors hover:text-white"
            >
              Tell the tech team
            </Link>{" "}
            what you were doing.
          </p>
        </div>
      </div>
    </main>
  );
}
