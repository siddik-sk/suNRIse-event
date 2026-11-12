"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Plus,
  Ticket,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { PassPanel } from "@/components/dashboard/pass-panel";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers/session-provider";
import { apiFetch } from "@/lib/client-api";
import type { RegistrationData } from "@/lib/client-types";
import { formatDate, initials } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useSession();
  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await apiFetch<{ registration: RegistrationData | null }>("/api/registrations");
        if (!cancelled) setRegistration(data.registration);
      } catch {
        if (!cancelled) setRegistration(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const events = useMemo(
    () =>
      [...(registration?.eventRegistrations ?? [])].sort(
        (a, b) => a.event.day - b.event.day || a.event.startTime.localeCompare(b.event.startTime),
      ),
    [registration],
  );

  const attended = events.filter((item) => item.attended).length;
  const days = new Set(events.map((item) => item.event.day)).size;
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Student console</p>
          <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
            Welcome back, <span className="text-gradient">{firstName}.</span>
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Your pass, line-up and festival details — all in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/dashboard/events" size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
            Add events
          </Button>
          <Button href="/dashboard/profile" size="sm" variant="secondary" icon={<UserCog className="h-3.5 w-3.5" />}>
            Edit profile
          </Button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon={CalendarDays} label="Events booked" value={loading ? "—" : String(events.length)} tone="cyan" />
        <StatCard icon={CheckCircle2} label="Days active" value={loading ? "—" : String(days)} tone="lime" />
        <StatCard
          icon={Ticket}
          label="Pass status"
          value={loading ? "—" : registration?.status === "CANCELLED" ? "Cancelled" : "Confirmed"}
          tone="magenta"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
        <div className="space-y-5">
          <section className="neon-frame rounded-2xl p-5 sm:p-6" aria-labelledby="lineup-heading">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Your line-up</p>
                <h2 id="lineup-heading" className="mt-1 font-display text-xl font-bold text-white">
                  {events.length > 0 ? `${events.length} events across ${days} day${days === 1 ? "" : "s"}` : "No events yet"}
                </h2>
              </div>
              <Link
                href="/dashboard/events"
                className="inline-flex items-center gap-1 text-xs font-semibold text-neon-cyan hover:underline"
              >
                Manage <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="mt-6 space-y-3" role="status" aria-live="polite">
                {[0, 1, 2].map((key) => (
                  <div key={key} className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
                ))}
                <span className="sr-only">Loading your events</span>
              </div>
            ) : events.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-9 text-center">
                <p className="text-sm font-medium text-white/75">Your line-up is empty.</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-white/40">
                  Pick from 47+ technical, cultural and workshop events. You can select up to six in total.
                </p>
                <Button href="/dashboard/events" size="sm" className="mt-4" icon={<Plus className="h-3.5 w-3.5" />}>
                  Browse events
                </Button>
              </div>
            ) : (
              <ol className="mt-5 space-y-2.5">
                {events.map(({ event, attended: isAttended }) => (
                  <li
                    key={event.id}
                    className="group flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3.5 transition hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                      <span className="font-mono text-[8px] uppercase tracking-widest text-white/30">Day</span>
                      <span className="font-display text-sm font-bold text-white">{event.day}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/events/${event.slug}`}
                          className="truncate text-sm font-semibold text-white/90 transition hover:text-neon-cyan"
                        >
                          {event.title}
                        </Link>
                        {isAttended ? (
                          <span className="rounded-full border border-neon-lime/25 bg-neon-lime/[0.07] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-neon-lime">
                            Attended
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/40">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-white/25" /> {event.startTime}–{event.endTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-white/25" /> {event.venue}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/25">
                          {event.department?.shortName}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {events.length > 0 && events.length < 6 ? (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-neon-cyan/20 bg-neon-cyan/[0.04] px-4 py-3">
                <p className="text-xs text-cyan-100/70">
                  You can still add {6 - events.length} more event{6 - events.length === 1 ? "" : "s"}.
                </p>
                <Link
                  href="/dashboard/events"
                  className="shrink-0 text-xs font-semibold text-neon-cyan hover:underline"
                >
                  Add now
                </Link>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6" aria-labelledby="profile-heading">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Profile</p>
                <h2 id="profile-heading" className="mt-1 font-display text-xl font-bold text-white">
                  Your details
                </h2>
              </div>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1 text-xs font-semibold text-neon-cyan hover:underline"
              >
                Edit <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon-magenta to-neon-purple font-mono text-sm font-bold text-white">
                {initials(user?.name ?? "N")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white/90">{user?.name}</p>
                <p className="truncate text-xs text-white/40">{user?.email}</p>
              </div>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail icon={GraduationCap} label="College" value={user?.college ?? "—"} />
              <Detail icon={CalendarDays} label="Department" value={user?.department ?? "—"} />
              <Detail icon={UserCog} label="Year" value={user?.year ?? "—"} />
              <Detail icon={Ticket} label="Roll number" value={user?.rollNumber ?? "—"} mono />
            </dl>

            <p className="mt-4 border-t border-white/5 pt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-white/25">
              Member since {user ? formatDate(user.createdAt) : "—"}
            </p>
          </section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <PassPanel />

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Fest snapshot</p>
            <ul className="mt-3 space-y-2.5 text-xs text-white/45">
              <li className="flex items-center justify-between gap-3">
                <span>Dates</span>
                <span className="font-medium text-white/75">19–21 Feb 2027</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Venue</span>
                <span className="text-right font-medium text-white/75">NRI University, Vijayawada</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Check-in</span>
                <span className="text-right font-medium text-white/75">Main gate · 8 AM</span>
              </li>
            </ul>
            <Link
              href="/schedule"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-neon-cyan hover:underline"
            >
              View full schedule <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "cyan" | "lime" | "magenta";
}) {
  const styles = {
    cyan: "border-neon-cyan/25 bg-neon-cyan/[0.05] text-neon-cyan",
    lime: "border-neon-lime/25 bg-neon-lime/[0.05] text-neon-lime",
    magenta: "border-neon-magenta/25 bg-neon-magenta/[0.05] text-neon-pink",
  }[tone];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${styles}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="font-display text-xl font-bold text-white">{value}</p>
        <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">{label}</p>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/25" />
      <div className="min-w-0">
        <dt className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">{label}</dt>
        <dd className={`truncate text-xs text-white/75 ${mono ? "font-mono" : ""}`}>{value}</dd>
      </div>
    </div>
  );
}
