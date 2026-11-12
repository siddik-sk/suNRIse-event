"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Download,
  Loader2,
  MapPin,
  Printer,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import type { PassData } from "@/lib/client-types";
import { formatDateTime, initials } from "@/lib/utils";

/**
 * Fetches the student's QR pass. `full` renders the large, printable pass view;
 * the default is the compact dashboard card.
 */
export function PassPanel({ full = false }: { full?: boolean }) {
  const { user } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<PassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<PassData & { ok: boolean }>("/api/registrations/pass");
      setData(result);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Could not load your pass.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function download() {
    if (!data) return;
    const link = document.createElement("a");
    link.href = data.dataUrl;
    link.download = `suNRIseevent27-${data.registrationId}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Pass downloaded. Keep it handy at the gate.", "success");
  }

  if (loading) {
    return (
      <div className="neon-frame flex min-h-[18rem] items-center justify-center rounded-2xl p-6">
        <div className="text-center" role="status" aria-live="polite">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-neon-cyan" />
          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Loading your pass</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="neon-frame rounded-2xl p-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-neon-amber/30 bg-neon-amber/[0.07] text-neon-amber">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="mt-3 text-sm font-semibold text-white/85">Pass unavailable</p>
        <p className="mt-1 text-xs leading-relaxed text-white/45">
          {error ?? "We could not find a fest pass for this account. Contact the help desk if this looks wrong."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => void load()} icon={<RefreshCw className="h-3.5 w-3.5" />}>
            Try again
          </Button>
          <Button href="/contact" variant="ghost" size="sm">
            Contact support
          </Button>
        </div>
      </div>
    );
  }

  const statusLabel =
    data.status === "CANCELLED" ? "Cancelled" : data.checkedInAt ? "Checked in" : "Ready to scan";

  if (full) {
    return (
      <div className="space-y-4">
        <div className="print-pass neon-frame relative overflow-hidden rounded-3xl">
          <div className="absolute inset-x-0 top-0 h-1 bg-fest-gradient" aria-hidden />
          <div className="border-b border-white/10 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-neon-cyan">
                  NRI University
                </p>
                <p className="mt-1 font-display text-2xl font-black tracking-tight text-white">
                  suNRIseevent <span className="text-gradient">&apos;27</span>
                </p>
                <p className="mt-1 text-xs text-white/40">19–21 February 2027 · Vijayawada</p>
              </div>
              <span className="rounded-full border border-neon-lime/30 bg-neon-lime/[0.07] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-lime">
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:p-7">
            <div className="mx-auto w-full max-w-[15rem]">
              <div className="qr-box rounded-2xl border border-white/10 bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.dataUrl}
                  alt={`QR code for pass ${data.registrationId}`}
                  width={512}
                  height={512}
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
                Scan at any gate
              </p>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon-magenta to-neon-purple font-mono text-sm font-bold text-white">
                  {initials(user?.name ?? "N")}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold text-white">{user?.name}</p>
                  <p className="truncate text-xs text-white/45">
                    {user?.department} · {user?.year}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
                <PassField label="Pass ID" value={data.registrationId} mono />
                <PassField label="College" value={user?.college ?? "—"} />
                <PassField label="Roll number" value={user?.rollNumber ?? "—"} mono />
                <PassField label="Events" value={`${data.events.length} selected`} />
                <PassField
                  label="Checked in"
                  value={data.checkedInAt ? formatDateTime(data.checkedInAt) : "Not yet"}
                />
                <PassField label="Status" value={data.status === "CANCELLED" ? "Cancelled" : "Confirmed"} />
              </dl>

              <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-3">
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/30">Line-up</p>
                <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
                  {data.events.map((event) => (
                    <li key={event.id} className="truncate text-[11px] text-white/55">
                      D{event.day} · {event.startTime} · {event.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 sm:px-7">
            <p className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
              <ShieldCheck className="h-3 w-3 text-neon-lime" /> Non-transferable · one entry per scan
            </p>
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">sunriseevent.in</p>
          </div>
        </div>

        <div className="no-print flex flex-wrap gap-2">
          <Button type="button" onClick={download} icon={<Download className="h-4 w-4" />}>
            Download PNG
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.print()} icon={<Printer className="h-4 w-4" />}>
            Print pass
          </Button>
          <Button href="/dashboard/events" variant="ghost" icon={<CalendarDays className="h-4 w-4" />}>
            Manage events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="neon-frame relative overflow-hidden rounded-2xl">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-fest-gradient" aria-hidden />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Your fest pass</p>
            <p className="mt-1 font-display text-lg font-bold text-white">{user?.name}</p>
            <p className="truncate text-[11px] text-white/40">{user?.college}</p>
          </div>
          <span
            className={
              data.checkedInAt
                ? "rounded-full border border-neon-lime/30 bg-neon-lime/[0.07] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-neon-lime"
                : "rounded-full border border-neon-cyan/30 bg-neon-cyan/[0.07] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-neon-cyan"
            }
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="qr-box shrink-0 rounded-xl border border-white/10 bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.dataUrl}
              alt={`QR code for pass ${data.registrationId}`}
              width={128}
              height={128}
              className="h-24 w-24 sm:h-28 sm:w-28"
            />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">Pass ID</p>
            <p className="truncate font-mono text-xs font-semibold tracking-wide text-neon-cyan">
              {data.registrationId}
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-white/45">
              <CalendarDays className="h-3 w-3 text-white/25" /> {data.events.length} events
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-white/45">
              <MapPin className="h-3 w-3 text-white/25" /> NRI Vijayawada
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button type="button" size="sm" className="flex-1" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
            Download
          </Button>
          <Button href="/dashboard/pass" size="sm" variant="secondary" className="flex-1" icon={<QrCode className="h-3.5 w-3.5" />}>
            Open pass
          </Button>
        </div>
      </div>
    </div>
  );
}

function PassField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">{label}</dt>
      <dd className={mono ? "mt-0.5 truncate font-mono text-xs text-white/80" : "mt-0.5 truncate text-xs text-white/80"}>
        {value}
      </dd>
    </div>
  );
}

/** Small status chip used by the overview page. */
export function PassStatusChip({ checkedIn }: { checkedIn: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/50">
      {checkedIn ? (
        <CheckCircle2 className="h-3 w-3 text-neon-lime" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
      )}
      {checkedIn ? "Checked in" : "Not checked in"}
    </span>
  );
}
