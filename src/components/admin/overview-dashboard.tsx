"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  IndianRupee,
  RefreshCw,
  ScanLine,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/client-api";
import type { AdminStats } from "@/lib/admin-types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/fest";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  backgroundColor: "#0d0620",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 12,
  fontSize: 12,
  color: "#fff",
  padding: "8px 12px",
};

export function OverviewDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ ok: boolean; stats: AdminStats }>("/api/admin/stats");
      setStats(data.stats);
    } catch {
      setError("Could not load live stats. Check the server and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-6 text-center">
        <p className="text-sm font-semibold text-red-200">{error ?? "Stats unavailable."}</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => void load()} icon={<RefreshCw className="h-3.5 w-3.5" />}>
          Retry
        </Button>
      </div>
    );
  }

  const categoryData = Object.entries(stats.categoryTotals).map(([category, value]) => ({
    name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category,
    value,
    color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ?? "#8b5cf6",
  }));
  const maxDept = Math.max(1, ...stats.byDepartment.map((department) => department.registrations));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Users} label="Students" value={stats.students.toLocaleString("en-IN")} hint={`${stats.colleges} colleges`} tone="cyan" />
        <Kpi icon={ClipboardList} label="Passes issued" value={stats.registrations.toLocaleString("en-IN")} hint="Confirmed registrations" tone="magenta" />
        <Kpi
          icon={ScanLine}
          label="Checked in"
          value={stats.checkedIn.toLocaleString("en-IN")}
          hint={`${stats.attendanceRate}% attendance`}
          tone="lime"
        />
        <Kpi icon={CalendarDays} label="Events live" value={stats.events.toLocaleString("en-IN")} hint={`${stats.departments} departments`} tone="purple" />
        <Kpi
          icon={Ticket}
          label="Event entries"
          value={stats.eventRegistrations.toLocaleString("en-IN")}
          hint={`${stats.attendedEvents} attended`}
          tone="cyan"
        />
        <Kpi
          icon={IndianRupee}
          label="Fee value"
          value={`₹${stats.revenue.toLocaleString("en-IN")}`}
          hint="Sum of event fees"
          tone="orange"
        />
        <Kpi icon={Building2} label="Departments" value={stats.departments.toLocaleString("en-IN")} hint="Hosting events" tone="purple" />
        <Kpi icon={CheckCircle2} label="Attendance rate" value={`${stats.attendanceRate}%`} hint="Gate check-ins" tone="lime" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="neon-frame rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Registrations</p>
              <h2 className="mt-1 font-display text-lg font-bold text-white">Last 7 days</h2>
            </div>
            <span className="rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.06] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-neon-cyan">
              Live
            </span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="admin-trend-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(0,240,255,0.3)" }} />
                <Area type="monotone" dataKey="count" name="Registrations" stroke="#00f0ff" strokeWidth={2} fill="url(#admin-trend-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="neon-frame rounded-2xl p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Event mix</p>
          <h2 className="mt-1 font-display text-lg font-bold text-white">Entries by category</h2>
          <div className="mt-2 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={3} stroke="none">
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {categoryData.map((entry) => (
              <li key={entry.name} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="inline-flex min-w-0 items-center gap-1.5 text-white/50">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="truncate">{entry.name}</span>
                </span>
                <span className="font-mono text-white/70">{entry.value}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="neon-frame rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Demand</p>
              <h2 className="mt-1 font-display text-lg font-bold text-white">Department entries</h2>
            </div>
            <Link href="/admin/departments" className="inline-flex items-center gap-1 text-[11px] font-semibold text-neon-cyan hover:underline">
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {stats.byDepartment.slice(0, 8).map((department) => (
              <li key={department.name}>
                <div className="flex items-center justify-between gap-3 text-[11px]">
                  <span className="truncate text-white/60">{department.fullName}</span>
                  <span className="shrink-0 font-mono text-white/45">
                    {department.registrations} · {department.events} events
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((department.registrations / maxDept) * 100)}%`,
                      background: `linear-gradient(90deg, ${
                        department.accent === "magenta"
                          ? "#ff2d95"
                          : department.accent === "orange"
                            ? "#ff8a00"
                            : department.accent === "purple"
                              ? "#8b5cf6"
                              : department.accent === "lime"
                                ? "#a3ff12"
                                : "#00f0ff"
                      }, rgba(255,255,255,0.25))`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="neon-frame rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Popular</p>
              <h2 className="mt-1 font-display text-lg font-bold text-white">Top events</h2>
            </div>
            <Link href="/admin/events" className="inline-flex items-center gap-1 text-[11px] font-semibold text-neon-cyan hover:underline">
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <ol className="mt-4 space-y-3">
            {stats.topEvents.map((event, index) => (
              <li key={event.id} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] font-mono text-[9px] text-white/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-xs font-semibold text-white/85">{event.title}</p>
                    <span className="shrink-0 font-mono text-[10px] text-white/40">
                      {event.registrations}/{event.capacity}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={cn("h-full rounded-full", event.fill >= 90 ? "bg-neon-magenta" : "bg-neon-cyan")}
                        style={{ width: `${event.fill}%` }}
                      />
                    </div>
                    <span className="font-mono text-[9px] text-white/30">
                      D{event.day} · {event.department}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button href="/admin/registrations" size="sm" icon={<ClipboardList className="h-3.5 w-3.5" />}>
          Review registrations
        </Button>
        <Button href="/admin/attendance" size="sm" variant="secondary" icon={<ScanLine className="h-3.5 w-3.5" />}>
          Open scanner
        </Button>
        <Button href="/admin/events" size="sm" variant="secondary" icon={<CalendarDays className="h-3.5 w-3.5" />}>
          Manage events
        </Button>
        <Button href="/admin/departments" size="sm" variant="secondary" icon={<GraduationCap className="h-3.5 w-3.5" />}>
          Departments
        </Button>
      </div>
    </div>
  );
}

const toneClasses = {
  cyan: "text-neon-cyan border-neon-cyan/25 bg-neon-cyan/[0.06]",
  magenta: "text-neon-pink border-neon-magenta/25 bg-neon-magenta/[0.06]",
  lime: "text-neon-lime border-neon-lime/25 bg-neon-lime/[0.05]",
  purple: "text-neon-violet border-neon-purple/25 bg-neon-purple/[0.08]",
  orange: "text-neon-amber border-neon-orange/25 bg-neon-orange/[0.06]",
} as const;

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone: keyof typeof toneClasses;
}) {
  return (
    <div className="neon-frame rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-black text-white">{value}</p>
          <p className="mt-1 text-[11px] text-white/35">{hint}</p>
        </div>
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
