"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, MailWarning, Send } from "lucide-react";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { Field, Input, FormAlert } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/providers/toast-provider";

export function VerifyEmailForm({ token, email = "" }: { token: string; email?: string }) {
  const { toast } = useToast();
  const [state, setState] = useState<"verifying" | "success" | "error" | "idle">(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState(email);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const data = await apiFetch<{ email: string }>("/api/auth/verify-email", {
          method: "POST",
          json: { token },
        });
        if (cancelled) return;
        setState("success");
        setResendEmail(data.email ?? email);
      } catch (err) {
        if (cancelled) return;
        setState("error");
        setMessage(err instanceof ApiClientError ? err.message : "Verification failed.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, email]);

  async function resend(event: React.FormEvent) {
    event.preventDefault();
    setResendError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendEmail)) {
      setResendError("Enter a valid email address.");
      return;
    }
    setResending(true);
    try {
      const data = await apiFetch<{ message: string }>("/api/auth/resend-verification", {
        method: "POST",
        json: { email: resendEmail.toLowerCase() },
      });
      toast(data.message, "success");
    } catch (err) {
      setResendError(err instanceof ApiClientError ? err.message : "Could not resend right now.");
    } finally {
      setResending(false);
    }
  }

  if (state === "verifying") {
    return (
      <div className="text-center" role="status" aria-live="polite">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-neon-cyan/30 bg-neon-cyan/[0.06]">
          <Loader2 className="h-7 w-7 animate-spin text-neon-cyan" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-3xl font-black text-white">Verifying your email…</h1>
        <p className="mt-3 text-sm text-white/45">Hang tight — this takes a second.</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-neon-lime/30 bg-neon-lime/[0.07]">
          <CheckCircle2 className="h-7 w-7 text-neon-lime" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-3xl font-black text-white">You&apos;re verified.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/50">
          Your account is active. Log in to download your QR pass and manage your events.
        </p>
        <Button href="/login?next=/dashboard" size="lg" className="mt-8" icon={<ArrowRight className="h-4 w-4" />}>
          Log in to your dashboard
        </Button>
        <p className="mt-4 text-xs text-white/30">
          Wrong account?{" "}
          <Link href="/register" className="text-neon-cyan hover:underline">
            Register again
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <span className="inline-grid h-14 w-14 place-items-center rounded-2xl border border-neon-amber/30 bg-neon-amber/[0.06]">
        <MailWarning className="h-6 w-6 text-neon-amber" aria-hidden />
      </span>
      <h1 className="mt-5 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
        {state === "error" ? "That link didn’t work." : "Verify your email."}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/45">
        {state === "error"
          ? message
          : "Enter the email you registered with and we’ll send a fresh verification link. The link expires in 24 hours."}
      </p>

      <form onSubmit={resend} className="mt-8 space-y-4" noValidate>
        {resendError ? <FormAlert>{resendError}</FormAlert> : null}
        <Field label="Email address" required>
          {(props) => (
            <Input
              {...props}
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              value={resendEmail}
              onChange={(event) => setResendEmail(event.target.value)}
            />
          )}
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={resending} icon={<Send className="h-4 w-4" />}>
          Resend verification link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Already verified?{" "}
        <Link href="/login" className="font-semibold text-white hover:text-neon-cyan">
          Log in
        </Link>
      </p>
    </div>
  );
}
