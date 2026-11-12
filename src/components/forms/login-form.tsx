"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, MailWarning } from "lucide-react";
import { apiFetch, fieldErrorsFrom, ApiClientError } from "@/lib/client-api";
import { loginSchema } from "@/lib/validation/schemas";
import { useSession } from "@/components/providers/session-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Field, Input, PasswordInput, FormAlert } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@/components/forms/turnstile";

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

  function update(key: "email" | "password", value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setUnverified(false);

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
      await refresh();
      toast("Welcome back to the grid.", "success");
      router.push(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        setErrors(fieldErrorsFrom(err));
        if (err.code === "EMAIL_UNVERIFIED") setUnverified(true);
      } else {
        setError("Could not log in. Try again.");
      }
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    try {
      await apiFetch("/api/auth/resend-verification", { method: "POST", json: { email: form.email } });
      toast("If the account needs verification, a fresh link is on its way.", "success");
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
          <FormAlert>
            <span className="flex items-start gap-2">
              {unverified ? <MailWarning className="mt-0.5 h-4 w-4 shrink-0" /> : null}
              <span>
                {error}
                {unverified ? (
                  <button
                    type="button"
                    onClick={resend}
                    disabled={resending}
                    className="mt-2 flex items-center gap-1.5 font-semibold text-neon-cyan hover:underline disabled:opacity-50"
                  >
                    {resending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    Resend verification email
                  </button>
                ) : null}
              </span>
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

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs font-medium text-neon-cyan/80 hover:text-neon-cyan">
            Forgot password?
          </Link>
        </div>

        <Turnstile onVerify={setTurnstileToken} />

        <Button type="submit" size="lg" className="w-full" loading={loading} icon={<ArrowRight className="h-4 w-4" />}>
          Log in
        </Button>
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
