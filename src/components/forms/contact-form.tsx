"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form";
import { Turnstile } from "@/components/forms/turnstile";
import { ApiClientError, apiFetch } from "@/lib/client-api";

type Values = { name: string; email: string; subject: string; message: string };

const empty: Values = { name: "", email: "", subject: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
    setFormError(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);
    setSuccess(null);

    try {
      const data = await apiFetch<{ ok: boolean; message: string }>("/api/contact", {
        method: "POST",
        json: { ...values, turnstileToken: turnstileToken || undefined },
      });
      setSuccess(data.message);
      setValues(empty);
      setTurnstileToken("");
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setErrors(caught.fieldErrors ?? {});
        setFormError(caught.message);
      } else {
        setFormError("Could not send your message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="neon-frame rounded-2xl p-7 text-center sm:p-9">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-neon-lime/30 bg-neon-lime/[0.07] text-neon-lime">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-black text-white">Message received.</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/50">{success}</p>
        <Button type="button" variant="secondary" size="sm" className="mt-5" onClick={() => setSuccess(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="neon-frame rounded-2xl p-5 sm:p-7" noValidate>
      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Send a message</p>
      <h2 className="mt-1 font-display text-2xl font-bold text-white">How can we help?</h2>
      <p className="mt-1 text-xs text-white/40">We reply within 48 hours on working days.</p>

      {formError ? (
        <div className="mt-4">
          <FormAlert>{formError}</FormAlert>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Your name" required error={errors.name}>
          {(props) => (
            <Input {...props} value={values.name} onChange={(event) => set("name", event.target.value)} autoComplete="name" />
          )}
        </Field>
        <Field label="Email" required error={errors.email}>
          {(props) => (
            <Input
              {...props}
              type="email"
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
              autoComplete="email"
            />
          )}
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Subject" required error={errors.subject}>
          {(props) => (
            <Input
              {...props}
              value={values.subject}
              onChange={(event) => set("subject", event.target.value)}
              placeholder="Registration help, sponsorship, accessibility…"
            />
          )}
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Message" required error={errors.message} hint="At least 20 characters.">
          {(props) => (
            <Textarea
              {...props}
              rows={6}
              value={values.message}
              onChange={(event) => set("message", event.target.value)}
              placeholder="Tell us what's up. Include your pass ID if it's about a registration."
            />
          )}
        </Field>
      </div>

      <Turnstile onVerify={setTurnstileToken} />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-[11px] leading-relaxed text-white/35">
          By sending this you agree to our{" "}
          <a href="/privacy" className="text-neon-cyan hover:underline">
            privacy policy
          </a>
          .
        </p>
        <Button type="submit" loading={loading} icon={<Send className="h-4 w-4" />}>
          Send message
        </Button>
      </div>
    </form>
  );
}
