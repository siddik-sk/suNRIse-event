import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, Trophy, Users } from "lucide-react";
import { TiltCard } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/section";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/fest";
import type { PublicEvent } from "@/lib/data";
import { cn } from "@/lib/utils";

const toneByCategory = {
  TECHNICAL: "cyan",
  NON_TECHNICAL: "orange",
  WORKSHOP: "lime",
  CULTURAL: "magenta",
} as const;

export function EventCard({ event, className }: { event: PublicEvent; className?: string }) {
  const accent = CATEGORY_COLORS[event.category];
  const tone = toneByCategory[event.category];
  const slug = event.department?.accent as string | undefined;

  return (
    <TiltCard className={cn("h-full", className)} accent={slug ?? tone}>
      <article className="neon-frame neon-frame-hover group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 sm:p-6">
        <div
          className="absolute inset-x-0 top-0 h-px opacity-70"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={tone}>{CATEGORY_LABELS[event.category]}</Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
              {event.department?.shortName}
            </span>
          </div>
          <span
            className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white/50"
            aria-label={`Day ${event.day}`}
          >
            D{event.day}
          </span>
        </div>

        <h3 className="mt-4 font-display text-xl font-bold leading-tight text-white transition-colors group-hover:text-neon-cyan">
          {event.title}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-white/50">{event.description}</p>

        <dl className="mt-5 grid grid-cols-2 gap-y-2.5 text-xs text-white/55">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-white/30" aria-hidden />
            <dt className="sr-only">Time</dt>
            <dd>{event.startTime}–{event.endTime}</dd>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-white/30" aria-hidden />
            <dt className="sr-only">Venue</dt>
            <dd className="truncate">{event.venue}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-neon-amber/70" aria-hidden />
            <dt className="sr-only">Prize</dt>
            <dd className="truncate text-neon-amber/80">{event.prize}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-white/30" aria-hidden />
            <dt className="sr-only">Team size</dt>
            <dd>Team {event.teamSize}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
            {event.fee > 0 ? `₹${event.fee} entry` : "Free entry"} · {event.capacity} seats
          </span>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 transition group-hover:text-neon-cyan"
            aria-label={`View ${event.title}`}
          >
            Details <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </article>
    </TiltCard>
  );
}
