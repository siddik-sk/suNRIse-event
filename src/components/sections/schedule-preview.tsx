import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { SectionHeading, Badge } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { FEST_DAYS } from "@/lib/fest";
import type { PublicEvent } from "@/lib/data";

const accents = ["cyan", "magenta", "orange"] as const;

const accentClasses = {
  cyan: { glow: "bg-neon-cyan/10 group-hover:bg-neon-cyan/20", text: "text-neon-cyan" },
  magenta: { glow: "bg-neon-magenta/10 group-hover:bg-neon-magenta/20", text: "text-neon-pink" },
  orange: { glow: "bg-neon-orange/10 group-hover:bg-neon-orange/20", text: "text-neon-amber" },
} as const;

export function SchedulePreview({ events }: { events: PublicEvent[] }) {
  return (
    <section className="relative section-pad" aria-labelledby="schedule-preview-heading">
      <div className="container-fest">
        <div data-gsap="fade-up">
          <SectionHeading
            eyebrow="19 — 21 February 2027"
            title={<span id="schedule-preview-heading">Three days. Zero idle time.</span>}
            description="A rough shape of the weekend. The full timetable, venues and clash-free picks live on the schedule page."
            action={
              <Button href="/schedule" variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>
                Full schedule
              </Button>
            }
          />
        </div>

        <div className="relative mt-12 grid gap-4 lg:grid-cols-3" data-gsap="stagger">
          <div className="pointer-events-none absolute inset-x-8 top-16 hidden h-px bg-gradient-to-r from-neon-cyan/30 via-neon-magenta/30 to-neon-orange/30 lg:block" aria-hidden />
          {FEST_DAYS.map((day, index) => {
            const dayEvents = events.filter((event) => event.day === day.day);
            const accent = accents[index];
            const accentClass = accentClasses[accent];
            return (
              <article
                key={day.day}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900/55 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/20"
              >
                <div className={`absolute -right-10 -top-12 h-40 w-40 rounded-full blur-3xl transition ${accentClass.glow}`} aria-hidden />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
                    Day 0{day.day}
                  </span>
                  <Badge tone={accent}>{dayEvents.length || "—"} events</Badge>
                </div>
                <p className="mt-6 font-display text-3xl font-black tracking-tight text-white">
                  {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", timeZone: "Asia/Kolkata" }).format(
                    new Date(day.date),
                  )}
                </p>
                <h3 className={`mt-1 font-display text-sm font-bold uppercase tracking-[0.16em] ${accentClass.text}`}>
                  {day.label.split("—")[1]?.trim()}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/45">{day.subtitle}</p>

                <ul className="mt-5 space-y-2 border-t border-white/10 pt-4">
                  {dayEvents.slice(0, 3).map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/events/${event.slug}`}
                        className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-xs text-white/55 transition hover:bg-white/[0.04] hover:text-white"
                      >
                        <span className="truncate">{event.title}</span>
                        <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] text-white/30">
                          <Clock3 className="h-3 w-3" aria-hidden /> {event.startTime}
                        </span>
                      </Link>
                    </li>
                  ))}
                  {dayEvents.length === 0 ? (
                    <li className="px-2 py-1.5 text-xs text-white/25">Line-up arriving soon.</li>
                  ) : null}
                </ul>

                <Link
                  href={`/schedule?day=${day.day}`}
                  className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-white/45 transition group-hover:text-neon-cyan"
                >
                  Day {day.day} timetable <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
