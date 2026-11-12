"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/form";
import { FAQS } from "@/lib/fest";
import { cn } from "@/lib/utils";

export function FaqList() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return FAQS.map((item, index) => ({ ...item, index }));
    return FAQS.map((item, index) => ({ ...item, index })).filter((item) =>
      `${item.q} ${item.a}`.toLowerCase().includes(term),
    );
  }, [query]);

  return (
    <div>
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search questions"
          className="pl-10"
          aria-label="Search frequently asked questions"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-sm font-semibold text-white/70">No answers matched “{query}”.</p>
          <p className="mt-1 text-xs text-white/40">
            Ask us directly on the{" "}
            <Link href="/contact" className="text-neon-cyan hover:underline">
              contact page
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {filtered.map((item) => {
            const expanded = open === item.index;
            return (
              <div key={item.q}>
                <h2>
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : item.index)}
                    aria-expanded={expanded}
                    aria-controls={`faq-panel-${item.index}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]"
                  >
                    <span className="text-sm font-semibold text-white/85">{item.q}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-white/35 transition-transform duration-300",
                        expanded && "rotate-180 text-neon-cyan",
                      )}
                    />
                  </button>
                </h2>
                <div
                  id={`faq-panel-${item.index}`}
                  hidden={!expanded}
                  className="px-5 pb-5 text-sm leading-relaxed text-white/50"
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div id="code-of-conduct" className="mt-10 scroll-mt-28 rounded-2xl border border-neon-cyan/20 bg-neon-cyan/[0.04] p-6">
        <p className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-neon-cyan">
          <ShieldCheck className="h-3.5 w-3.5" /> Code of conduct
        </p>
        <h2 className="mt-2 font-display text-xl font-bold text-white">Everyone gets to enjoy the fest.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          Harassment, discrimination and unsafe behaviour have no place on campus. Read the full policy, including how to
          report an issue and what happens next.
        </p>
        <Link href="/code-of-conduct" className="mt-3 inline-flex text-xs font-semibold text-neon-cyan hover:underline">
          Read the full code of conduct →
        </Link>
      </div>
    </div>
  );
}
