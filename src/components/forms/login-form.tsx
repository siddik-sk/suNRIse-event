"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Loader2, MailWarning, RefreshCw, ShieldCheck } from "lucide-react";
import { apiFetch, fieldErrorsFrom, ApiClientError } from "@/lib/client-api";
import { loginSchema } from "@/lib/validation/schemas";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Field, Input, PasswordInput, FormAlert } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@/components/forms/turnstile";

const RESEND_COOLDOWN_SECONDS = 30;

function safeNext(next: string) {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const router = useRouter();
  const { refresh } = useSession();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  // Email OTP state
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (unverified) otpRef.current?.focus();
  }, [unverified]);

  function update(key: "email" | "password", value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    if (key === "email") {
      setUnverified(false);
      setOtp("");
      setOtpError(null);
      setDevOtp(null);
      setCooldown(0);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ ...form, turnstileToken });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) nextErrors[issue.path.join(".")] = issue.message;
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/login", { method: "POST", json: parsed.data });
      setUnverified(false);
      await refresh();
      toast("Welcome back to the grid.", "success");
      router.push(safeNext(next));
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "EMAIL_UNVERIFIED") {
          // The API just emailed a fresh code; reveal the OTP panel.
          setUnverified(true);
          setOtp("");
          setOtpError(null);
          setCooldown(RESEND_COOLDOWN_SECONDS);
          const code = err.data?.devOtp;
          setDevOtp(typeof code === "string" ? code : null);
          setError(err.message);
        } else {
          setError(err.message);
          setErrors(fieldErrorsFrom(err));
        }
      } else {
        setError("Could not log in. Try again.");
      }
      setLoading(false);
    }
  }

  async function verifyOtp() {
    setOtpError(null);
    const code = otp.replace(/\D/g, "");
    if (!/^\d{6}$/.test(code)) {
      setOtpError("Enter the 6-digit code from your email.");
      otpRef.current?.focus();
      return;
    }

    setVerifying(true);
    try {
      await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        json: { email: form.email, otp: code },
      });
      setUnverified(false);
      await refresh();
      toast("Email verified. Welcome to the grid.", "success");
      router.push(safeNext(next));
      router.refresh();
    } catch (err) {
      setOtpError(err instanceof ApiClientError ? err.message : "Could not verify that code.");
      if (err instanceof ApiClientError && (err.code === "OTP_EXPIRED" || err.code === "OTP_ATTEMPTS_EXCEEDED")) {
        setCooldown(0);
      }
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    setOtpError(null);
    try {
      const data = await apiFetch<{ message: string; devOtp?: string }>("/api/auth/resend-verification", {
        method: "POST",
        json: { email: form.email },
      });
      if (typeof data.devOtp === "string") setDevOtp(data.devOtp);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast(data.message, "success");
    } catch {
      toast("Could not resend right now. Try again in a minute.", "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <div>
      <p className="eyebrow mb-4">Welcome back</p>
      <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
        Log in to your <span className="text-gradient">pass.</span>
      </h1>
      <p className="mt-3 text-sm text-white/45">
        View your events, download your QR pass and grab more events before they fill up.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {error ? (
          <FormAlert tone={unverified ? "info" : "error"}>
            <span className="flex items-start gap-2">
              {unverified ? <MailWarning className="mt-0.5 h-4 w-4 shrink-0" /> : null}
              <span>{error}</span>
            </span>
          </FormAlert>
        ) : null}

        <Field label="Email address" error={errors.email} required>
          {(props) => (
            <Input
              {...props}
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              invalid={Boolean(errors.email)}
            />
          )}
        </Field>

        <Field label="Password" error={errors.password} required>
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              invalid={Boolean(errors.password)}
            />
          )}
        </Field>

        {unverified ? (
          <div className="rounded-2xl border border-neon-cyan/25 bg-neon-cyan/[0.04] p-4">
            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.24em] text-neon-cyan">
              <KeyRound className="h-3.5 w-3.5" aria-hidden /> Email verification
            </div>
            <p className="mt-2 text-xs leading-relaxed text-white/55">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-white/80">{form.email || "your email"}</span>. Enter it
              below to finish logging in.
            </p>

            <Field label="6-digit code" error={otpError ?? undefined} className="mt-3">
              {(props) => (
                <Input
                  {...props}
                  ref={otpRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void verifyOtp();
                    }
                  }}
                  className="text-center font-mono text-lg tracking-[0.5em]"
                  invalid={Boolean(otpError)}
                />
              )}
            </Field>

            <Button
              type="button"
              onClick={() => void verifyOtp()}
              loading={verifying}
              size="lg"
              className="mt-1 w-full"
              icon={<ShieldCheck className="h-4 w-4" />}
            >
              Verify &amp; log in
            </Button>

            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => void resend()}
                disabled={resending || cooldown > 0}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neon-cyan transition hover:underline disabled:cursor-not-allowed disabled:text-white/35 disabled:no-underline"
              >
                <RefreshCw className={resending ? "h-3 w-3 animate-spin" : "h-3 w-3"} aria-hidden />
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-white/30">
                Expires in 10 min
              </span>
            </div>

            {devOtp ? (
              <p className="mt-3 rounded-lg border border-dashed border-neon-lime/30 bg-black/25 px-3 py-2 text-[11px] text-neon-lime/90">
                Dev code (no mail provider configured):{" "}
                <span className="font-mono tracking-[0.3em] text-white">{devOtp}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-medium text-neon-cyan/80 hover:text-neon-cyan">
            Forgot password?
          </Link>
        </div>

        {!unverified ? <Turnstile onVerify={setTurnstileToken} /> : null}

        {unverified ? null : (
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={loading}
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Log in
          </Button>
        )}

        {unverified ? (
          <button
            type="button"
            onClick={() => {
              setUnverified(false);
              setOtp("");
              setOtpError(null);
              setDevOtp(null);
              setError(null);
            }}
            className="w-full text-center text-xs text-white/40 transition hover:text-white/70"
          >
            Use a different account
          </button>
        ) : null}
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        New to suNRIseevent?{" "}
        <Link href="/register" className="font-semibold text-white hover:text-neon-cyan">
          Create your pass
        </Link>
      </p>

      {process.env.NODE_ENV !== "production" ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/30">Demo accounts</p>
          <div className="mt-2 space-y-1 font-mono text-[11px] text-white/50">
            <p>student@sunriseevent.in · Student@Sunrise27</p>
            <p>admin@sunriseevent.in · Admin@Sunrise27</p>
          </div>
          <p className="mt-2 text-[10px] text-white/25">Seeded for local review. Remove before going live.</p>
        </div>
      ) : null}
    </div>
  );
}
