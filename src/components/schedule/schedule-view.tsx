"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, MapPin, Printer, RotateCcw, Search, Trophy } from "lucide-react";
import { Input, Select } from "@/components/ui/form";
import { CATEGORY_COLORS, CATEGORY_LABELS, FEST_DAYS } from "@/lib/fest";
import type { PublicEvent } from "@/lib/data";
import { cn } from "@/lib/utils";

type DepartmentOption = { slug: string; name: string; shortName: string };

export function ScheduleView({
  events,
  departments,
}: {
  events: PublicEvent[];
  departments: DepartmentOption[];
}) {
  const [day, setDay] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return events.filter((event) => {
      if (day !== "ALL" && event.day !== Number(day)) return false;
      if (category !== "ALL" && event.category !== category) return false;
      if (department !== "ALL" && event.department?.slug !== department) return false;
      if (!term) return true;
      return [event.title, event.venue, event.department?.name, event.department?.shortName]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [category, day, department, events, query]);

  const groups = useMemo(() => {
    return FEST_DAYS.map((info) => ({
      ...info,
      events: filtered
        .filter((event) => event.day === info.day)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    })).filter((group) => (day === "ALL" || group.day === Number(day)) && group.events.length > 0);
  }, [day, filtered]);

  const active = day !== "ALL" || category !== "ALL" || department !== "ALL" || Boolean(query);

  function reset() {
    setDay("ALL");
    setCategory("ALL");
    setDepartment("ALL");
    setQuery("");
  }

  return (
    <div>
      <div className="no-print neon-frame rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap gap-1.5">
            {[{ value: "ALL", label: "All days" }, ...FEST_DAYS.map((info) => ({ value: String(info.day), label: `Day ${info.day}` }))].map(
              (item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDay(item.value)}
                  aria-pressed={day === item.value}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition",
                    day === item.value
                      ? "border-neon-cyan/50 bg-neon-cyan/[0.1] text-neon-cyan"
                      : "border-white/10 bg-white/[0.03] text-white/45 hover:border-white/25 hover:text-white",
                  )}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/55 transition hover:border-neon-cyan/30 hover:text-white"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the schedule"
              className="pl-10"
              aria-label="Search schedule"
            />
          </div>
          <Select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
            <option value="ALL">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            aria-label="Filter by department"
          >
            <option value="ALL">All departments</option>
            {departments.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.shortName} — {item.name}
              </option>
            ))}
          </Select>
        </div>

        {active ? (
          <button
            type="button"
            onClick={reset}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-neon-cyan hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset filters
          </button>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-white/20" />
          <p className="mt-3 text-sm font-semibold text-white/70">Nothing scheduled for those filters.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 text-xs font-semibold text-neon-cyan hover:underline"
          >
            Show the full schedule
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {groups.map((group) => (
            <section key={group.day} aria-labelledby={`day-${group.day}`}>
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">
                    {group.label}
                  </p>
                  <h2 id={`day-${group.day}`} className="mt-1 font-display text-2xl font-black text-white sm:text-3xl">
                    {new Intl.DateTimeFormat("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      timeZone: "Asia/Kolkata",
                    }).format(new Date(`${group.date}T09:00:00+05:30`))}
                  </h2>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/40">{group.subtitle}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/45">
                  {group.events.length} events
                </span>
              </div>

              <ol className="mt-4 space-y-2">
                {group.events.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.slug}`}
                      className="group grid gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3.5 transition hover:border-white/25 hover:bg-white/[0.045] sm:grid-cols-[6.5rem_1fr_auto] sm:items-center"
                    >
                      <div className="flex items-center gap-2 sm:block">
                        <p className="font-mono text-sm font-semibold text-white/85">{event.startTime}</p>
                        <p className="font-mono text-[10px] text-white/30">to {event.endTime}</p>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white/90 transition group-hover:text-neon-cyan">
                            {event.title}
                          </p>
                          <span
                            className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]"
                            style={{ color: CATEGORY_COLORS[event.category] }}
                          >
                            {CATEGORY_LABELS[event.category]}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/40">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-white/25" /> {event.venue}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 text-white/25" /> {event.department?.shortName}
                          </span>
                          <span className="inline-flex items-center gap-1 text-neon-amber/70">
                            <Trophy className="h-3 w-3" /> {event.prize}
                          </span>
                        </div>
                      </div>

                      <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-white/40 transition group-hover:text-neon-cyan sm:inline-flex">
                        Details <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
