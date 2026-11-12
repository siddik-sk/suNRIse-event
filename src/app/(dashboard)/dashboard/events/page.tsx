"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormAlert, Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/providers/toast-provider";
import { ApiClientError, apiFetch } from "@/lib/client-api";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/fest";
import type { ClientCategory, ClientEvent, RegistrationData } from "@/lib/client-types";
import { cn } from "@/lib/utils";

const MAX_EVENTS = 6;

type Slot = { id: string; title: string; day: number; startTime: string; endTime: string };

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function findClash(events: Slot[]): string | null {
  const sorted = [...events].sort((a, b) => a.day - b.day || toMinutes(a.startTime) - toMinutes(b.startTime));
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      if (sorted[i].day !== sorted[j].day) continue;
      if (toMinutes(sorted[j].startTime) < toMinutes(sorted[i].endTime)) {
        return `${sorted[i].title} and ${sorted[j].title} overlap on Day ${sorted[i].day}.`;
      }
    }
  }
  return null;
}

export default function DashboardEventsPage() {
  const { toast } = useToast();
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [events, setEvents] = useState<ClientEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [day, setDay] = useState("ALL");
  const [department, setDepartment] = useState("ALL");

  async function loadAll() {
    setLoading(true);
    setLoadError(null);
    try {
      const [reg, list] = await Promise.all([
        apiFetch<{ registration: RegistrationData | null }>("/api/registrations"),
        apiFetch<{ events: ClientEvent[] }>("/api/events"),
      ]);
      setRegistration(reg.registration);
      setEvents(list.events);
    } catch (caught) {
      setLoadError(caught instanceof ApiClientError ? caught.message : "Could not load your events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const registered = useMemo(
    () =>
      [...(registration?.eventRegistrations ?? [])].sort(
        (a, b) => a.event.day - b.event.day || a.event.startTime.localeCompare(b.event.startTime),
      ),
    [registration],
  );
  const registeredIds = useMemo(() => new Set(registered.map((item) => item.eventId)), [registered]);

  const selectedEvents = useMemo(
    () => selected.map((id) => events.find((event) => event.id === id)).filter(Boolean) as ClientEvent[],
    [events, selected],
  );

  const clash = useMemo(() => {
    const slots: Slot[] = [
      ...registered.map(({ event }) => ({
        id: event.id,
        title: event.title,
        day: event.day,
        startTime: event.startTime,
        endTime: event.endTime,
      })),
      ...selectedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        day: event.day,
        startTime: event.startTime,
        endTime: event.endTime,
      })),
    ];
    return findClash(slots);
  }, [registered, selectedEvents]);

  const totalEvents = registered.length + selected.length;
  const atLimit = totalEvents >= MAX_EVENTS;
  const remaining = Math.max(0, MAX_EVENTS - totalEvents);

  const departmentOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const event of events) {
      const short = event.department?.shortName ?? "NOVA";
      const name = event.department?.name ?? "suNRIseevent";
      if (!seen.has(name)) seen.set(name, short);
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [events]);

  const available = useMemo(() => {
    const term = query.trim().toLowerCase();
    return events.filter((event) => {
      if (registeredIds.has(event.id)) return false;
      if (category !== "ALL" && event.category !== category) return false;
      if (day !== "ALL" && event.day !== Number(day)) return false;
      if (department !== "ALL" && event.department?.name !== department) return false;
      if (!term) return true;
      return [event.title, event.venue, event.department?.name, event.department?.shortName, CATEGORY_LABELS[event.category]]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [category, day, department, events, query, registeredIds]);

  function toggle(event: ClientEvent) {
    setSubmitError(null);
    setSelected((previous) => {
      if (previous.includes(event.id)) return previous.filter((id) => id !== event.id);
      if (totalEvents >= MAX_EVENTS) {
        toast(`You can book up to ${MAX_EVENTS} events in total.`, "info");
        return previous;
      }
      return [...previous, event.id];
    });
  }

  async function addEvents() {
    if (selected.length === 0) return;
    setSubmitError(null);
    if (clash) {
      setSubmitError(clash);
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiFetch<{ registration: RegistrationData }>("/api/registrations", {
        method: "POST",
        json: { eventIds: selected },
      });
      setRegistration(data.registration);
      setSelected([]);
      toast("Events added to your pass.", "success");
    } catch (caught) {
      const message = caught instanceof ApiClientError ? caught.message : "Could not add those events.";
      setSubmitError(message);
      toast(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">My events</p>
          <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
            Your <span className="text-gradient">line-up.</span>
          </h1>
          <p className="mt-2 text-sm text-white/45">
            {registered.length} booked · {remaining} slot{remaining === 1 ? "" : "s"} left · clashes are blocked
            automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => void loadAll()} icon={<RefreshCw className="h-3.5 w-3.5" />}>
            Refresh
          </Button>
          <Button href="/schedule" size="sm" variant="ghost" icon={<CalendarDays className="h-3.5 w-3.5" />}>
            Schedule
          </Button>
        </div>
      </header>

      {loadError ? (
        <FormAlert>
          <span className="flex items-center justify-between gap-3">
            <span>{loadError}</span>
            <button type="button" onClick={() => void loadAll()} className="shrink-0 font-semibold underline">
              Retry
            </button>
          </span>
        </FormAlert>
      ) : null}

      <section className="neon-frame rounded-2xl p-5 sm:p-6" aria-labelledby="booked-heading">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Booked</p>
            <h2 id="booked-heading" className="mt-1 font-display text-xl font-bold text-white">
              Confirmed events
            </h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
            {registered.length}/{MAX_EVENTS}
          </span>
        </div>

        {loading ? (
          <div className="mt-5 space-y-2.5" role="status" aria-live="polite">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
            <span className="sr-only">Loading booked events</span>
          </div>
        ) : registered.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-8 text-center">
            <p className="text-sm font-medium text-white/70">No events booked yet.</p>
            <p className="mt-1 text-xs text-white/40">Pick your first event from the list below.</p>
          </div>
        ) : (
          <ol className="mt-5 space-y-2.5">
            {registered.map(({ event, attended }) => (
              <li
                key={event.id}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3.5"
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/events/${event.slug}`}
                      className="truncate text-sm font-semibold text-white/90 hover:text-neon-cyan"
                    >
                      {event.title}
                    </Link>
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
                      {event.department?.shortName}
                    </span>
                    {attended ? (
                      <span className="rounded-full border border-neon-lime/25 bg-neon-lime/[0.07] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-neon-lime">
                        Attended
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/40">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3 text-white/25" /> Day {event.day}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 text-white/25" /> {event.startTime}–{event.endTime}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-white/25" /> {event.venue}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/events/${event.slug}`}
                  className="mt-1 shrink-0 text-white/30 transition hover:text-neon-cyan"
                  aria-label={`View ${event.title}`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="neon-frame rounded-2xl p-5 sm:p-6" aria-labelledby="add-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Add more</p>
            <h2 id="add-heading" className="mt-1 font-display text-xl font-bold text-white">
              Browse the full roster
            </h2>
            <p className="mt-1 text-xs text-white/40">
              {atLimit
                ? "You have reached the six-event limit. Contact the help desk for changes."
                : `${remaining} more event${remaining === 1 ? "" : "s"} can be added.`}
            </p>
          </div>
        </div>

        {submitError ? (
          <div className="mt-4">
            <FormAlert>
              <span className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </span>
            </FormAlert>
          </div>
        ) : null}
        {clash ? (
          <div className="mt-4">
            <FormAlert>
              <span className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{clash} Remove one selection before saving.</span>
              </span>
            </FormAlert>
          </div>
        ) : null}

        {selectedEvents.length > 0 ? (
          <div className="mt-4 rounded-xl border border-neon-cyan/25 bg-neon-cyan/[0.05] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-neon-cyan/80">
                {selectedEvents.length} selected · not saved yet
              </p>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="text-[11px] font-medium text-white/45 hover:text-white"
              >
                Clear
              </button>
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {selectedEvents.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => toggle(event)}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/70 hover:border-neon-pink/40 hover:text-neon-pink"
                  >
                    {event.title}
                    <X className="h-2.5 w-2.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 grid gap-2.5 sm:grid-cols-[1fr_auto_auto]">
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
          <Select value={day} onChange={(event) => setDay(event.target.value)} aria-label="Filter by day">
            <option value="ALL">All days</option>
            <option value="1">Day 1</option>
            <option value="2">Day 2</option>
            <option value="3">Day 3</option>
          </Select>
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
            className="sm:col-span-3"
          >
            <option value="ALL">All departments</option>
            {departmentOptions.map(([name, short]) => (
              <option key={short} value={name}>
                {short} — {name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mt-4 max-h-[32rem] space-y-2.5 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-white/45">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading roster…
            </div>
          ) : available.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-5 py-10 text-center">
              <p className="text-sm text-white/65">
                {events.length === registeredIds.size ? "You're registered for every event on the roster." : "No events match those filters."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("ALL");
                  setDay("ALL");
                  setDepartment("ALL");
                }}
                className="mt-2 text-xs font-semibold text-neon-cyan hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            available.map((event) => {
              const isSelected = selected.includes(event.id);
              const blocked = !isSelected && atLimit;
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => toggle(event)}
                  aria-pressed={isSelected}
                  disabled={blocked}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
                    isSelected
                      ? "border-neon-cyan/50 bg-neon-cyan/[0.07]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
                    blocked && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                      isSelected
                        ? "border-neon-cyan bg-neon-cyan text-ink-950"
                        : "border-white/25 bg-white/[0.04] text-transparent",
                    )}
                    aria-hidden
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white/90">{event.title}</span>
                      <span
                        className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]"
                        style={{ color: CATEGORY_COLORS[event.category] }}
                      >
                        {CATEGORY_LABELS[event.category]}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/30">
                        {event.department?.shortName}
                      </span>
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/40">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3 text-white/25" /> Day {event.day} · {event.startTime}–
                        {event.endTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-white/25" /> {event.venue}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3 text-white/25" /> Team {event.teamSize}
                      </span>
                      <span className={event.fee > 0 ? "text-neon-amber/80" : "text-neon-lime/70"}>
                        {event.fee > 0 ? `₹${event.fee}` : "Free"}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <p className="inline-flex items-center gap-1.5 text-xs text-white/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-neon-lime" />
            {selected.length > 0 ? `${selected.length} ready to add` : "Select events to add"}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelected([])}
              disabled={selected.length === 0 || submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => void addEvents()}
              loading={submitting}
              disabled={selected.length === 0 || Boolean(clash) || atLimit}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add to pass
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
