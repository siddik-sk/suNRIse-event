"use client";

import { useMemo, useState } from "react";
import { Filter, RotateCcw, Search, Sparkles } from "lucide-react";
import { EventCard } from "@/components/cards/event-card";
import { Input, Select } from "@/components/ui/form";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/fest";
import type { PublicEvent } from "@/lib/data";

type DepartmentOption = { slug: string; name: string; shortName: string };

export function EventDirectory({
  events,
  departments,
}: {
  events: PublicEvent[];
  departments: DepartmentOption[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [day, setDay] = useState("ALL");
  const [department, setDepartment] = useState("ALL");
  const [sort, setSort] = useState("schedule");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const rows = events.filter((event) => {
      if (category !== "ALL" && event.category !== category) return false;
      if (day !== "ALL" && event.day !== Number(day)) return false;
      if (department !== "ALL" && event.department?.slug !== department) return false;
      if (!term) return true;
      return [event.title, event.description, event.venue, event.department?.name, event.department?.shortName]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });

    return rows.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "prize") return b.capacity - a.capacity;
      return a.day - b.day || a.startTime.localeCompare(b.startTime);
    });
  }, [category, day, department, events, query, sort]);

  const active = query || category !== "ALL" || day !== "ALL" || department !== "ALL" || sort !== "schedule";

  function reset() {
    setQuery("");
    setCategory("ALL");
    setDay("ALL");
    setDepartment("ALL");
    setSort("schedule");
  }

  return (
    <div>
      <div className="neon-frame rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            <Filter className="h-3.5 w-3.5 text-neon-cyan" /> Filter the roster
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
            {filtered.length} / {events.length} events
          </p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events, venues, departments"
              className="pl-10"
              aria-label="Search events"
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
          <Select value={day} onChange={(event) => setDay(event.target.value)} aria-label="Filter by day">
            <option value="ALL">All days</option>
            <option value="1">Day 1 · 19 Feb</option>
            <option value="2">Day 2 · 20 Feb</option>
            <option value="3">Day 3 · 21 Feb</option>
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
          <Select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort events">
            <option value="schedule">Sort: schedule</option>
            <option value="title">Sort: A–Z</option>
            <option value="prize">Sort: biggest capacity</option>
          </Select>
        </div>

        {active ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neon-cyan hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset filters
            </button>
            <div className="flex flex-wrap gap-1.5">
              {category !== "ALL" ? (
                <Chip color={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]} label={CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]} />
              ) : null}
              {day !== "ALL" ? <Chip label={`Day ${day}`} /> : null}
              {department !== "ALL" ? (
                <Chip label={departments.find((item) => item.slug === department)?.shortName ?? department} />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-white/20" />
          <p className="mt-3 text-sm font-semibold text-white/70">No events match those filters.</p>
          <p className="mt-1 text-xs text-white/40">Try a different day, department or search term.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/40 px-4 py-2 text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/10"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Show all events
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({ label, color }: { label: string; color?: string }) {
  return (
    <span
      className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/55"
      style={color ? { borderColor: `${color}55`, color } : undefined}
    >
      {label}
    </span>
  );
}
