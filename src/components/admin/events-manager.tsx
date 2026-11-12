"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select, Textarea } from "@/components/ui/form";
import { useToast } from "@/components/providers/toast-provider";
import { ApiClientError, apiFetch } from "@/lib/client-api";
import type { AdminDepartment, AdminEvent } from "@/lib/admin-types";
import { CATEGORY_COLORS, CATEGORY_LABELS, FEST_DAYS } from "@/lib/fest";
import { cn } from "@/lib/utils";

type FormValues = {
  title: string;
  description: string;
  category: string;
  departmentId: string;
  day: string;
  startTime: string;
  endTime: string;
  venue: string;
  prize: string;
  rules: string;
  coordinators: { name: string; phone: string }[];
  capacity: string;
  teamSize: string;
  fee: string;
  isFeatured: boolean;
  isActive: boolean;
};

const emptyForm: FormValues = {
  title: "",
  description: "",
  category: "TECHNICAL",
  departmentId: "",
  day: "1",
  startTime: "09:00",
  endTime: "11:00",
  venue: "",
  prize: "",
  rules: "",
  coordinators: [{ name: "", phone: "" }],
  capacity: "50",
  teamSize: "1",
  fee: "0",
  isFeatured: false,
  isActive: true,
};

export function EventsManager() {
  const { toast } = useToast();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [departments, setDepartments] = useState<AdminDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [day, setDay] = useState("ALL");
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventData, departmentData] = await Promise.all([
        apiFetch<{ ok: boolean; events: AdminEvent[] }>("/api/admin/events"),
        apiFetch<{ ok: boolean; departments: AdminDepartment[] }>("/api/admin/departments"),
      ]);
      setEvents(eventData.events);
      setDepartments(departmentData.departments);
    } catch {
      setError("Could not load events. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return events.filter((event) => {
      if (category !== "ALL" && event.category !== category) return false;
      if (day !== "ALL" && event.day !== Number(day)) return false;
      if (!term) return true;
      return `${event.title} ${event.department?.name ?? ""} ${event.venue}`.toLowerCase().includes(term);
    });
  }, [category, day, events, query]);

  async function toggleActive(event: AdminEvent) {
    setBusyId(event.id);
    try {
      const data = await apiFetch<{ ok: boolean; event: AdminEvent }>(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        json: { isActive: !event.isActive },
      });
      setEvents((previous) => previous.map((row) => (row.id === event.id ? { ...row, ...data.event } : row)));
      toast(`${event.title} ${event.isActive ? "hidden from" : "published to"} the public site.`, "success");
    } catch (caught) {
      toast(caught instanceof ApiClientError ? caught.message : "Could not update the event.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(event: AdminEvent) {
    const registrations = event._count.registrations;
    const confirmed = window.confirm(
      `Delete “${event.title}”?${
        registrations > 0 ? `\n\nThis will also remove ${registrations} student registration${registrations === 1 ? "" : "s"}.` : ""
      }`,
    );
    if (!confirmed) return;

    setBusyId(event.id);
    try {
      await apiFetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
      setEvents((previous) => previous.filter((row) => row.id !== event.id));
      toast(`${event.title} deleted.`, "success");
    } catch (caught) {
      toast(caught instanceof ApiClientError ? caught.message : "Could not delete the event.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="neon-frame rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[14rem] flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events or venues"
              className="pl-10"
              aria-label="Search events"
            />
          </div>
          <Select value={category} onChange={(event) => setCategory(event.target.value)} className="w-auto" aria-label="Filter by category">
            <option value="ALL">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select value={day} onChange={(event) => setDay(event.target.value)} className="w-auto" aria-label="Filter by day">
            <option value="ALL">All days</option>
            {FEST_DAYS.map((info) => (
              <option key={info.day} value={info.day}>
                Day {info.day}
              </option>
            ))}
          </Select>
          <Button variant="ghost" size="sm" onClick={() => void load()} icon={<RefreshCw className="h-3.5 w-3.5" />}>
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreating(true)} icon={<Plus className="h-3.5 w-3.5" />}>
            New event
          </Button>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
          {filtered.length} of {events.length} events · {events.filter((event) => event.isActive).length} published
        </p>
      </div>

      {error ? <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-5 text-sm text-red-200">{error}</div> : null}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-white/20" />
          <p className="mt-3 text-sm font-semibold text-white/70">No events match those filters.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((event) => (
            <article
              key={event.id}
              className={cn(
                "neon-frame group rounded-2xl p-4 transition",
                !event.isActive && "opacity-60",
                busyId === event.id && "pointer-events-none opacity-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className="rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]"
                      style={{
                        color: CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS],
                        borderColor: `${CATEGORY_COLORS[event.category as keyof typeof CATEGORY_COLORS]}55`,
                      }}
                    >
                      {CATEGORY_LABELS[event.category as keyof typeof CATEGORY_LABELS]}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
                      {event.department?.shortName ?? "—"}
                    </span>
                    {event.isFeatured ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-neon-amber/30 bg-neon-amber/[0.07] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-neon-amber">
                        <Sparkles className="h-2.5 w-2.5" /> Featured
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 truncate font-display text-base font-bold text-white">{event.title}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/40">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Day {event.day}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {event.startTime}–{event.endTime}
                    </span>
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3" /> {event.venue}
                    </span>
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] text-white/55">
                  {event._count.registrations}/{event.capacity}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-white/35">{event.fee > 0 ? `₹${event.fee}` : "Free"}</span>
                  <span className="font-mono text-[10px] text-white/25">·</span>
                  <span className="font-mono text-[10px] text-white/35">Team {event.teamSize}</span>
                  {event.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-neon-lime/25 bg-neon-lime/[0.05] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-neon-lime">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Live
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white/35">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleActive(event)}
                    className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/55 transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                  >
                    {event.isActive ? "Hide" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(event)}
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-white/50 transition hover:border-neon-cyan/40 hover:text-neon-cyan"
                    aria-label={`Edit ${event.title}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(event)}
                    className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-white/40 transition hover:border-red-500/40 hover:text-red-300"
                    aria-label={`Delete ${event.title}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {creating || editing ? (
        <EventDialog
          event={editing}
          departments={departments}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={(saved, mode) => {
            setEvents((previous) =>
              mode === "create" ? [...previous, saved] : previous.map((row) => (row.id === saved.id ? saved : row)),
            );
            setCreating(false);
            setEditing(null);
            toast(mode === "create" ? "Event created." : "Event updated.", "success");
          }}
        />
      ) : null}
    </div>
  );
}

function EventDialog({
  event,
  departments,
  onClose,
  onSaved,
}: {
  event: AdminEvent | null;
  departments: AdminDepartment[];
  onClose: () => void;
  onSaved: (event: AdminEvent, mode: "create" | "edit") => void;
}) {
  const [values, setValues] = useState<FormValues>(() =>
    event
      ? {
          title: event.title,
          description: event.description,
          category: event.category,
          departmentId: event.departmentId,
          day: String(event.day),
          startTime: event.startTime,
          endTime: event.endTime,
          venue: event.venue,
          prize: event.prize,
          rules: Array.isArray(event.rules) ? event.rules.join("\n") : "",
          coordinators:
            Array.isArray(event.coordinators) && event.coordinators.length > 0
              ? (event.coordinators as { name: string; phone: string }[]).map((item) => ({
                  name: item.name ?? "",
                  phone: item.phone ?? "",
                }))
              : [{ name: "", phone: "" }],
          capacity: String(event.capacity),
          teamSize: event.teamSize,
          fee: String(event.fee),
          isFeatured: event.isFeatured,
          isActive: event.isActive,
        }
      : { ...emptyForm, departmentId: departments[0]?.id ?? "" },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(keyEvent: KeyboardEvent) {
      if (keyEvent.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setFormError(null);
  }

  async function submit(formEvent: React.FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError(null);

    const payload = {
      title: values.title,
      description: values.description,
      category: values.category,
      departmentId: values.departmentId,
      day: Number(values.day),
      startTime: values.startTime,
      endTime: values.endTime,
      venue: values.venue,
      prize: values.prize,
      rules: values.rules
        .split("\n")
        .map((rule) => rule.trim())
        .filter(Boolean),
      coordinators: values.coordinators
        .map((item) => ({ name: item.name.trim(), phone: item.phone.trim() }))
        .filter((item) => item.name && item.phone),
      capacity: Number(values.capacity),
      teamSize: values.teamSize,
      fee: Number(values.fee),
      isFeatured: values.isFeatured,
      isActive: values.isActive,
    };

    try {
      const data = await apiFetch<{ ok: boolean; event: AdminEvent }>(
        event ? `/api/admin/events/${event.id}` : "/api/admin/events",
        { method: event ? "PATCH" : "POST", json: payload },
      );
      onSaved(data.event, event ? "edit" : "create");
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setErrors(caught.fieldErrors ?? {});
        setFormError(caught.message);
      } else {
        setFormError("Could not save the event. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[170] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close event form" onClick={onClose} className="absolute inset-0 bg-ink-950/85 backdrop-blur-sm" />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-950 sm:rounded-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{event ? "Edit event" : "New event"}</p>
            <h2 className="font-display text-lg font-bold text-white">{event ? event.title : "Add to the roster"}</h2>
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

        <form onSubmit={submit} className="flex-1 space-y-4 overflow-y-auto p-5" noValidate>
          {formError ? <FormAlert>{formError}</FormAlert> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" required error={errors.title} className="sm:col-span-2">
              {(props) => <Input {...props} value={values.title} onChange={(e) => set("title", e.target.value)} />}
            </Field>
            <Field label="Description" required error={errors.description} className="sm:col-span-2">
              {(props) => (
                <Textarea {...props} rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} />
              )}
            </Field>
            <Field label="Category" required error={errors.category}>
              {(props) => (
                <Select {...props} value={values.category} onChange={(e) => set("category", e.target.value)}>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Department" required error={errors.departmentId}>
              {(props) => (
                <Select {...props} value={values.departmentId} onChange={(e) => set("departmentId", e.target.value)}>
                  <option value="">Select a department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.shortName} — {department.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Day" required error={errors.day}>
              {(props) => (
                <Select {...props} value={values.day} onChange={(e) => set("day", e.target.value)}>
                  {FEST_DAYS.map((info) => (
                    <option key={info.day} value={info.day}>
                      Day {info.day} · {info.date}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" required error={errors.startTime}>
                {(props) => <Input {...props} type="time" value={values.startTime} onChange={(e) => set("startTime", e.target.value)} />}
              </Field>
              <Field label="End" required error={errors.endTime}>
                {(props) => <Input {...props} type="time" value={values.endTime} onChange={(e) => set("endTime", e.target.value)} />}
              </Field>
            </div>
            <Field label="Venue" required error={errors.venue}>
              {(props) => <Input {...props} value={values.venue} onChange={(e) => set("venue", e.target.value)} />}
            </Field>
            <Field label="Prize" required error={errors.prize}>
              {(props) => (
                <Input {...props} value={values.prize} onChange={(e) => set("prize", e.target.value)} placeholder="₹25,000 · Winner" />
              )}
            </Field>
            <Field label="Capacity" required error={errors.capacity}>
              {(props) => (
                <Input {...props} type="number" min={1} value={values.capacity} onChange={(e) => set("capacity", e.target.value)} />
              )}
            </Field>
            <Field label="Team size" required error={errors.teamSize}>
              {(props) => (
                <Input {...props} value={values.teamSize} onChange={(e) => set("teamSize", e.target.value)} placeholder="1–4" />
              )}
            </Field>
            <Field label="Fee (₹)" required error={errors.fee}>
              {(props) => (
                <Input {...props} type="number" min={0} value={values.fee} onChange={(e) => set("fee", e.target.value)} />
              )}
            </Field>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="inline-flex items-center gap-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  checked={values.isFeatured}
                  onChange={(e) => set("isFeatured", e.target.checked)}
                  className="h-4 w-4 accent-[#ff2d95]"
                />
                Featured
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-white/65">
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="h-4 w-4 accent-[#a3ff12]"
                />
                Published
              </label>
            </div>
          </div>

          <Field label="Rules" hint="One rule per line." error={errors.rules}>
            {(props) => <Textarea {...props} rows={4} value={values.rules} onChange={(e) => set("rules", e.target.value)} />}
          </Field>

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-white/75">Coordinators</p>
              <button
                type="button"
                onClick={() => set("coordinators", [...values.coordinators, { name: "", phone: "" }])}
                className="text-[11px] font-semibold text-neon-cyan hover:underline"
                disabled={values.coordinators.length >= 4}
              >
                + Add coordinator
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {values.coordinators.map((coordinator, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    value={coordinator.name}
                    onChange={(e) =>
                      set(
                        "coordinators",
                        values.coordinators.map((item, i) => (i === index ? { ...item, name: e.target.value } : item)),
                      )
                    }
                    placeholder="Name"
                    aria-label={`Coordinator ${index + 1} name`}
                  />
                  <Input
                    value={coordinator.phone}
                    onChange={(e) =>
                      set(
                        "coordinators",
                        values.coordinators.map((item, i) => (i === index ? { ...item, phone: e.target.value } : item)),
                      )
                    }
                    placeholder="10-digit phone"
                    aria-label={`Coordinator ${index + 1} phone`}
                  />
                  <button
                    type="button"
                    onClick={() => set("coordinators", values.coordinators.filter((_, i) => i !== index))}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 text-white/40 hover:border-red-500/40 hover:text-red-300"
                    aria-label="Remove coordinator"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              {event ? "Save changes" : "Create event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
