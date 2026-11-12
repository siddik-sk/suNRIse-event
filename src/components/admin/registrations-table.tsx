"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  IdCard,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { apiFetch } from "@/lib/client-api";
import type { AdminEvent, AdminPagination, AdminRegistration } from "@/lib/admin-types";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

type Filters = {
  q: string;
  college: string;
  department: string;
  eventId: string;
  attended: string;
  page: number;
};

const initialFilters: Filters = { q: "", college: "", department: "", eventId: "", attended: "", page: 1 };

export function RegistrationsTable() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<AdminRegistration[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({ page: 1, pageSize: 20, total: 0, pages: 1 });
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminRegistration | null>(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiFetch<{ ok: boolean; events: AdminEvent[] }>("/api/admin/events");
        setEvents(data.events);
      } catch {
        // Filters degrade gracefully without the event list.
      }
    })();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((previous) => (previous.q === search ? previous : { ...previous, q: search, page: 1 }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.college) params.set("college", filters.college);
    if (filters.department) params.set("department", filters.department);
    if (filters.eventId) params.set("eventId", filters.eventId);
    if (filters.attended) params.set("attended", filters.attended);
    params.set("page", String(filters.page));
    params.set("pageSize", "20");
    return params.toString();
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{
        ok: boolean;
        registrations: AdminRegistration[];
        pagination: AdminPagination;
      }>(`/api/admin/registrations?${queryString}`);
      setRows(data.registrations);
      setPagination(data.pagination);
    } catch {
      setError("Could not load registrations. Try refreshing.");
    } finally {
      setLoading(false);
      firstLoad.current = false;
    }
  }, [queryString]);

  useEffect(() => {
    void load();
  }, [load]);

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((previous) => ({ ...previous, [key]: value, page: key === "page" ? (value as number) : 1 }));
  }

  function reset() {
    setSearch("");
    setFilters(initialFilters);
  }

  const activeFilters = Boolean(filters.q || filters.college || filters.department || filters.eventId || filters.attended);
  const exportHref = `/api/admin/registrations/export?${queryString}`;

  return (
    <div className="space-y-4">
      <div className="neon-frame rounded-2xl p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_0.9fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, roll number or pass ID"
              className="pl-10"
              aria-label="Search registrations"
            />
          </div>
          <Input
            value={filters.college}
            onChange={(event) => update("college", event.target.value)}
            placeholder="Filter by college"
            aria-label="Filter by college"
          />
          <Input
            value={filters.department}
            onChange={(event) => update("department", event.target.value)}
            placeholder="Filter by department"
            aria-label="Filter by department"
          />
          <Select value={filters.eventId} onChange={(event) => update("eventId", event.target.value)} aria-label="Filter by event">
            <option value="">All events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                D{event.day} · {event.title}
              </option>
            ))}
          </Select>
          <Select value={filters.attended} onChange={(event) => update("attended", event.target.value)} aria-label="Filter by check-in">
            <option value="">Any check-in</option>
            <option value="true">Checked in</option>
            <option value="false">Not checked in</option>
          </Select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
              {pagination.total.toLocaleString("en-IN")} registrations
            </p>
            {activeFilters ? (
              <button type="button" onClick={reset} className="text-[11px] font-semibold text-neon-cyan hover:underline">
                Clear filters
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => void load()} icon={<RefreshCw className="h-3.5 w-3.5" />}>
              Refresh
            </Button>
            <a
              href={exportHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neon-cyan/40 bg-neon-cyan/[0.04] px-4 text-xs font-semibold text-neon-cyan transition hover:border-neon-cyan hover:bg-neon-cyan/10"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </a>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-5 text-sm text-red-200">{error}</div>
      ) : null}

      <div className="neon-frame overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Pass ID</th>
                <th className="px-4 py-3 font-medium">College</th>
                <th className="px-4 py-3 font-medium">Events</th>
                <th className="px-4 py-3 font-medium">Registered</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading && firstLoad.current
                ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-white/[0.06]">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="h-6 animate-pulse rounded-lg bg-white/[0.04]" />
                      </td>
                    </tr>
                  ))
                : null}

              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Users className="mx-auto h-8 w-8 text-white/20" />
                    <p className="mt-3 text-sm font-semibold text-white/70">No registrations match those filters.</p>
                    <p className="mt-1 text-xs text-white/35">Clear the filters or search for a different student.</p>
                  </td>
                </tr>
              ) : null}

              {rows.map((row) => (
                <tr key={row.id} className="border-b border-white/[0.06] transition hover:bg-white/[0.025]">
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold text-white/85">{row.user.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-white/35">{row.user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-neon-cyan">{row.registrationId}</span>
                    <p className="mt-0.5 font-mono text-[10px] text-white/30">{row.user.rollNumber}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-[12rem] truncate text-[12px] text-white/70">{row.user.college}</p>
                    <p className="mt-0.5 text-[10px] text-white/30">
                      {row.user.department} · {row.user.year}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/55">
                      {row.eventRegistrations.length} selected
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-white/45">{formatDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    {row.checkedInAt ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-neon-lime/25 bg-neon-lime/[0.06] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-neon-lime">
                        <CheckCircle2 className="h-2.5 w-2.5" /> In
                      </span>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">
                        Waiting
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/60 transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                    >
                      View <ChevronDown className="h-3 w-3 -rotate-90" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
          <p className="text-[11px] text-white/35">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => update("page", pagination.page - 1)}
              icon={<ArrowLeft className="h-3.5 w-3.5" />}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.pages || loading}
              onClick={() => update("page", pagination.page + 1)}
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {selected ? <RegistrationDrawer registration={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function RegistrationDrawer({ registration, onClose }: { registration: AdminRegistration; onClose: () => void }) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const row = registration;

  return (
    <div className="fixed inset-0 z-[160] flex justify-end">
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
      />
      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-ink-950 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-ink-950/95 px-5 py-4 backdrop-blur-xl">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Registration</p>
            <p className="font-mono text-sm text-neon-cyan">{row.registrationId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/45 hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <section>
            <h2 className="font-display text-xl font-bold text-white">{row.user.name}</h2>
            <p className="mt-0.5 text-xs text-white/40">
              {row.user.department} · {row.user.year} · {row.user.rollNumber}
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <a href={`mailto:${row.user.email}`} className="flex items-center gap-2 text-white/65 hover:text-neon-cyan">
                <Mail className="h-3.5 w-3.5 text-white/25" /> {row.user.email}
              </a>
              <a href={`tel:${row.user.phone}`} className="flex items-center gap-2 text-white/65 hover:text-neon-cyan">
                <Phone className="h-3.5 w-3.5 text-white/25" /> +91 {row.user.phone}
              </a>
              <p className="flex items-start gap-2 text-white/65">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/25" /> {row.user.college}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.025] p-3.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Check-in</p>
            <p className="mt-1 text-sm text-white/80">
              {row.checkedInAt ? formatDateTime(row.checkedInAt) : "Not checked in yet"}
            </p>
            <p className="mt-1 text-[11px] text-white/35">
              Registered {formatDateTime(row.createdAt)} · Status {row.status.toLowerCase()}
            </p>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Events</p>
              <span className="font-mono text-[10px] text-white/30">{row.eventRegistrations.length}</span>
            </div>
            <ul className="mt-2 space-y-2">
              {row.eventRegistrations.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-white/85">{entry.event.title}</p>
                    {entry.attended ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-neon-lime/25 bg-neon-lime/[0.06] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-neon-lime">
                        <CheckCircle2 className="h-2.5 w-2.5" /> In
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white/30">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-white/35">
                    Day {entry.event.day} · {entry.event.startTime} · {entry.event.venue} · {entry.event.department.shortName}
                  </p>
                </li>
              ))}
              {row.eventRegistrations.length === 0 ? (
                <li className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-white/35">
                  No events selected.
                </li>
              ) : null}
            </ul>
          </section>

          <section>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">College ID</p>
            {row.user.uploads.length === 0 ? (
              <p className="mt-2 rounded-xl border border-dashed border-white/10 p-3 text-xs text-white/35">
                No ID uploaded.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {row.user.uploads.map((upload) => (
                  <li key={upload.id}>
                    <a
                      href={`/api/admin/uploads/${upload.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3 transition hover:border-neon-cyan/30 hover:bg-white/[0.04]"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-neon-cyan">
                        {upload.mimeType === "application/pdf" ? <FileText className="h-4 w-4" /> : <IdCard className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-white/80">{upload.originalName}</span>
                        <span className="text-[10px] text-white/35">{(upload.size / 1024 / 1024).toFixed(2)} MB</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/35" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className={cn("rounded-xl border border-white/10 bg-white/[0.02] p-3 text-[10px] leading-relaxed text-white/30")}>
            Access to college IDs is logged. Only share verification details with the student or campus authorities when
            necessary.
          </p>
        </div>
      </aside>
    </div>
  );
}
