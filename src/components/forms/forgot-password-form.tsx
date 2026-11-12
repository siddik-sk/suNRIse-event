"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { apiFetch, ApiClientError } from "@/lib/client-api";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { Field, Input, FormAlert } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@/components/forms/turnstile";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldError(null);

    const parsed = forgotPasswordSchema.safeParse({ email, turnstileToken });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/forgot-password", { method: "POST", json: parsed.data });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not send the reset link. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-neon-lime/30 bg-neon-lime/[0.07]">
          <MailCheck className="h-7 w-7 text-neon-lime" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-3xl font-black text-white">Check your inbox.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/50">
          If an account exists for <span className="text-white">{email}</span>, a reset link is on its way. The link
          expires in 60 minutes.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button href="/login" variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to login
          </Button>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-xs text-white/35 transition hover:text-white"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow mb-4">Account recovery</p>
      <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
        Reset your <span className="text-gradient">password.</span>
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-white/45">
        Enter the email you registered with. We&apos;ll send a single-use link to choose a new password.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {error ? <FormAlert>{error}</FormAlert> : null}
        <Field label="Email address" error={fieldError ?? undefined} required>
          {(props) => (
            <Input
              {...props}
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              invalid={Boolean(fieldError)}
            />
          )}
        </Field>

        <Turnstile onVerify={setTurnstileToken} />

        <Button type="submit" size="lg" className="w-full" loading={loading} icon={<ArrowRight className="h-4 w-4" />}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-white hover:text-neon-cyan">
          Log in
        </Link>
      </p>
    </div>
  );
}
