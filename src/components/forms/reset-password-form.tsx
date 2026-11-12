"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { apiFetch, ApiClientError, fieldErrorsFrom } from "@/lib/client-api";
import { resetPasswordSchema } from "@/lib/validation/schemas";
import { Field, PasswordInput, FormAlert } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

function strength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const score = useMemo(() => strength(form.password), [form.password]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setErrors({});

    const parsed = resetPasswordSchema.safeParse({ token, ...form });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) nextErrors[issue.path.join(".")] = issue.message;
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", { method: "POST", json: parsed.data });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not reset your password. Try again.");
      setErrors(fieldErrorsFrom(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-neon-lime/30 bg-neon-lime/[0.07]">
          <CheckCircle2 className="h-7 w-7 text-neon-lime" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-3xl font-black text-white">Password updated.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/50">
          For security, every existing session was signed out. Use your new password to get back in.
        </p>
        <Button href="/login" size="lg" className="mt-8" icon={<ArrowRight className="h-4 w-4" />}>
          Log in
        </Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-neon-magenta/30 bg-neon-magenta/[0.07]">
          <ShieldCheck className="h-7 w-7 text-neon-pink" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-3xl font-black text-white">Link missing.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/50">
          This page needs a valid reset token. Request a fresh link and open it from your inbox.
        </p>
        <Button href="/forgot-password" className="mt-8">
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow mb-4">Choose a new password</p>
      <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
        Secure your <span className="text-gradient">account.</span>
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-white/45">
        Use at least 8 characters with uppercase, lowercase, a number and a symbol. This link works once and
        expires in 60 minutes.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {error ? <FormAlert>{error}</FormAlert> : null}

        <Field label="New password" error={errors.password} required>
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="new-password"
              placeholder="New password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              invalid={Boolean(errors.password)}
            />
          )}
        </Field>

        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                score > index
                  ? score <= 2
                    ? "bg-neon-magenta"
                    : score === 3
                      ? "bg-neon-amber"
                      : "bg-neon-lime"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        <Field label="Confirm new password" error={errors.confirmPassword} required>
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="new-password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              invalid={Boolean(errors.confirmPassword)}
            />
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" loading={loading} icon={<ShieldCheck className="h-4 w-4" />}>
          Update password
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-white/35">
        Need a new link?{" "}
        <Link href="/forgot-password" className="text-neon-cyan hover:underline">
          Request again
        </Link>
      </p>
    </div>
  );
}
