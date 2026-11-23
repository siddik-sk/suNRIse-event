"use client";

// A full page reload is intentional in this boundary: the client router itself
// may be part of what failed, so plain anchors are safer than next/link here.
/* eslint-disable @next/next/no-html-link-for-pages */

/**
 * Last-resort boundary: catches failures in the root layout itself, where the
 * shared stylesheet, fonts and providers may not be available. Styles are
 * therefore intentionally inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,92,246,.28), transparent 70%), #05010d",
          color: "#f1edff",
          fontFamily: "'Space Grotesk', system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <title>suNRIseevent &rsquo;27 — Temporary problem</title>
        <main style={{ maxWidth: 560, textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#00f0ff",
            }}
          >
            suNRIseevent &rsquo;27
          </p>

          <h1
            style={{
              margin: "1rem 0 0",
              fontFamily: "Orbitron, ui-sans-serif, system-ui, sans-serif",
              fontSize: "clamp(1.8rem, 6vw, 2.6rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            The whole grid went dark.
          </h1>

          <p style={{ margin: "1rem 0 0", color: "rgba(241,237,255,.6)", lineHeight: 1.6 }}>
            Something failed before the festival site could load. Refresh to restart the show — your data has not
            been touched.
          </p>

          {error.digest ? (
            <p
              style={{
                display: "inline-block",
                marginTop: "1.25rem",
                padding: "0.35rem 0.9rem",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.05)",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 11,
                color: "rgba(241,237,255,.45)",
              }}
            >
              ref {error.digest}
            </p>
          ) : null}

          <div style={{ marginTop: "2rem", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                cursor: "pointer",
                border: 0,
                borderRadius: 999,
                padding: "0.85rem 1.75rem",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                background: "linear-gradient(110deg, #ff2d95, #ff8a00 35%, #00f0ff 75%, #8b5cf6)",
              }}
            >
              Reload the site
            </button>
            <a
              href="/"
              style={{
                borderRadius: 999,
                padding: "0.85rem 1.75rem",
                fontSize: 14,
                fontWeight: 600,
                color: "#f1edff",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,.14)",
                background: "rgba(255,255,255,.05)",
              }}
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
