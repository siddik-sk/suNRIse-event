"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Keyboard,
  Loader2,
  RotateCcw,
  ScanLine,
  Search,
  Ticket,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { useToast } from "@/components/providers/toast-provider";
import { ApiClientError, apiFetch } from "@/lib/client-api";
import type { AdminEvent, ScanResult } from "@/lib/admin-types";
import { cn, formatDateTime } from "@/lib/utils";

export function AttendanceScanner() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastScanRef = useRef<{ value: string; at: number }>({ value: "", at: 0 });

  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [eventId, setEventId] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [manual, setManual] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string; name: string; at: string; duplicate: boolean }[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await apiFetch<{ ok: boolean; events: AdminEvent[] }>("/api/admin/events");
        setEvents(data.events.filter((event) => event.isActive));
      } catch {
        // The scanner still works for general check-in without an event list.
      }
    })();
  }, []);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraOn(false);
  }, []);

  const submit = useCallback(
    async (qr: string) => {
      const value = qr.trim();
      if (value.length < 10) {
        toast("That code looks too short. Scan the full pass QR or paste the pass ID.", "error");
        return;
      }

      setSubmitting(true);
      setScanError(null);
      try {
        const data = await apiFetch<ScanResult>("/api/admin/attendance", {
          method: "POST",
          json: { qr: value, eventId: eventId || undefined },
        });
        setResult(data);
        setHistory((previous) =>
          [
            {
              id: data.registration.registrationId,
              name: data.registration.user.name,
              at: new Date().toISOString(),
              duplicate: data.alreadyAttended,
            },
            ...previous,
          ].slice(0, 8),
        );
        if (data.alreadyAttended) {
          toast(`${data.registration.user.name} was already checked in${data.markedEvent ? ` for ${data.markedEvent.title}` : ""}.`, "info");
        } else {
          toast(`${data.registration.user.name} checked in.`, "success");
        }
        setManual("");
      } catch (caught) {
        const message = caught instanceof ApiClientError ? caught.message : "Could not check in that pass.";
        setScanError(message);
        setResult(null);
        toast(message, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [eventId, toast],
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setStarting(true);
    setResult(null);
    setScanError(null);

    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const video = videoRef.current;
      if (!video) throw new Error("Camera element unavailable.");

      const controls = await reader.decodeFromVideoDevice(undefined, video, (decoded) => {
        if (!decoded) return;
        const text = decoded.getText();
        const now = Date.now();
        if (lastScanRef.current.value === text && now - lastScanRef.current.at < 4000) return;
        lastScanRef.current = { value: text, at: now };
        stopCamera();
        void submit(text);
      });

      controlsRef.current = controls;
      setCameraOn(true);
    } catch (error) {
      const message =
        error instanceof Error && /permission|denied|notallowed/i.test(error.message)
          ? "Camera permission was denied. Allow camera access or use the manual pass ID field."
          : "Could not start the camera on this device. Use the manual pass ID field instead.";
      setCameraError(message);
      setCameraOn(false);
    } finally {
      setStarting(false);
    }
  }, [stopCamera, submit]);

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr] xl:items-start">
      <div className="space-y-4">
        <section className="neon-frame rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Scanner</p>
              <h2 className="mt-0.5 font-display text-lg font-bold text-white">Point at a pass QR</h2>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[8px] uppercase tracking-[0.16em]",
                cameraOn
                  ? "border-neon-lime/25 bg-neon-lime/[0.05] text-neon-lime"
                  : "border-white/10 bg-white/[0.03] text-white/40",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", cameraOn ? "animate-pulse bg-neon-lime" : "bg-white/30")} />
              {cameraOn ? "Camera live" : "Camera idle"}
            </span>
          </div>

          <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/60">
            <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
            {!cameraOn ? (
              <div className="absolute inset-0 grid place-items-center bg-ink-950/70 p-6 text-center">
                {starting ? (
                  <div>
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-neon-cyan" />
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Starting camera</p>
                  </div>
                ) : (
                  <div>
                    <CameraOff className="mx-auto h-7 w-7 text-white/25" />
                    <p className="mt-2 text-xs text-white/45">Camera is off</p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => void startCamera()}
                      icon={<Camera className="h-3.5 w-3.5" />}
                    >
                      Start camera
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-neon-cyan/50" aria-hidden />
                <div className="absolute inset-x-3 bottom-3 flex justify-center">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink-950/80 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/60 backdrop-blur hover:text-white"
                  >
                    <CameraOff className="h-3 w-3" /> Stop
                  </button>
                </div>
              </>
            )}
          </div>

          {cameraError ? (
            <p className="mt-3 flex items-start gap-2 rounded-xl border border-neon-amber/25 bg-neon-amber/[0.05] p-3 text-[11px] leading-relaxed text-neon-amber">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {cameraError}
            </p>
          ) : null}
        </section>

        <section className="neon-frame rounded-2xl p-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-neon-cyan" />
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Manual entry</p>
          </div>
          <form
            className="mt-2 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void submit(manual);
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <Input
                value={manual}
                onChange={(event) => setManual(event.target.value)}
                placeholder="SUN27-XXXXXX or SUNRISE27:token"
                className="pl-10 font-mono text-xs"
                aria-label="Pass ID or QR payload"
              />
            </div>
            <Button type="submit" loading={submitting} icon={<ScanLine className="h-4 w-4" />}>
              Check in
            </Button>
          </form>

          <div className="mt-3">
            <label htmlFor="scanner-event" className="text-[11px] font-medium text-white/55">
              Mark attendance for an event (optional)
            </label>
            <Select
              id="scanner-event"
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
              className="mt-1.5"
            >
              <option value="">General gate check-in only</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  Day {event.day} · {event.title}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-[10px] leading-relaxed text-white/30">
              Selecting an event also marks that event as attended. General check-in records the pass at the gate.
            </p>
          </div>
        </section>
      </div>

      <div className="space-y-4">
        {scanError ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-4 text-sm text-red-200">{scanError}</div>
        ) : null}

        {submitting && !result ? (
          <div className="neon-frame grid place-items-center rounded-2xl p-10">
            <Loader2 className="h-6 w-6 animate-spin text-neon-cyan" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">Checking pass</p>
          </div>
        ) : null}

        {result ? (
          <section className="neon-frame overflow-hidden rounded-2xl">
            <div
              className={cn(
                "flex items-center gap-3 border-b p-4",
                result.alreadyAttended
                  ? "border-neon-amber/25 bg-neon-amber/[0.06]"
                  : "border-neon-lime/25 bg-neon-lime/[0.05]",
              )}
            >
              <span
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-full border",
                  result.alreadyAttended
                    ? "border-neon-amber/30 text-neon-amber"
                    : "border-neon-lime/30 text-neon-lime",
                )}
              >
                {result.alreadyAttended ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-white">{result.registration.user.name}</p>
                <p className="font-mono text-[10px] text-white/40">
                  {result.alreadyAttended
                    ? "Already checked in · entry allowed"
                    : result.markedEvent
                      ? `Checked in · ${result.markedEvent.title}`
                      : "Checked in at the gate"}
                </p>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <Info label="Pass ID" value={result.registration.registrationId} mono />
                <Info label="Roll number" value={result.registration.user.rollNumber} mono />
                <Info label="College" value={result.registration.user.college} />
                <Info label="Department" value={result.registration.user.department} />
                <Info label="Check-in time" value={formatDateTime(result.registration.checkedInAt)} />
                <Info label="Phone" value={`+91 ${result.registration.user.phone}`} />
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Events</p>
                <ul className="mt-2 space-y-1.5">
                  {result.registration.events.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] font-medium text-white/80">{entry.title}</span>
                        <span className="font-mono text-[9px] text-white/30">
                          Day {entry.day} · {entry.startTime} · {entry.venue}
                        </span>
                      </span>
                      {entry.attended ? (
                        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[8px] uppercase tracking-[0.1em] text-neon-lime">
                          <UserCheck className="h-3 w-3" /> In
                        </span>
                      ) : (
                        <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-white/25">Pending</span>
                      )}
                    </li>
                  ))}
                  {result.registration.events.length === 0 ? (
                    <li className="rounded-lg border border-dashed border-white/10 px-3 py-2 text-[11px] text-white/30">
                      No events selected.
                    </li>
                  ) : null}
                </ul>
              </div>

              <Button variant="secondary" size="sm" onClick={() => setResult(null)} icon={<RotateCcw className="h-3.5 w-3.5" />}>
                Scan next pass
              </Button>
            </div>
          </section>
        ) : null}

        {!result && !submitting ? (
          <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-8 text-center">
            <Ticket className="mx-auto h-7 w-7 text-white/20" />
            <p className="mt-2 text-sm font-semibold text-white/60">Waiting for a pass.</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/35">
              Start the camera or paste a pass ID. Check-ins are logged and can be exported later.
            </p>
          </div>
        ) : null}

        {history.length > 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">This session</p>
            <ul className="mt-2 space-y-1.5">
              {history.map((entry, index) => (
                <li key={`${entry.id}-${index}`} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="min-w-0 truncate text-white/60">{entry.name}</span>
                  <span className="shrink-0 font-mono text-[9px] text-white/30">
                    {entry.id} {entry.duplicate ? "· duplicate" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">{label}</p>
      <p className={cn("mt-0.5 break-words text-white/75", mono && "font-mono text-[10px]")}>{value}</p>
    </div>
  );
}
