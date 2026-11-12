import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, MailCheck, QrCode, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEST } from "@/lib/fest";
import { maskEmail } from "@/lib/utils";

export const metadata: Metadata = {
  title: "You're registered",
  robots: { index: false, follow: false },
};

export default async function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; id?: string }>;
}) {
  const params = await searchParams;
  const email = (params.email ?? "").slice(0, 254);
  const registrationId = (params.id ?? "").slice(0, 40);
  const safeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";

  const steps = [
    {
      icon: MailCheck,
      title: "Verify your email",
      body: "Open the link we just sent you. The link expires in 24 hours. Check spam if it is not there.",
    },
    {
      icon: QrCode,
      title: "Log in to your dashboard",
      body: "Your pass, event line-up and profile live in one place. You can add more events any time.",
    },
    {
      icon: Download,
      title: "Download your QR pass",
      body: "Save it to your phone or print it. The same pass works at every gate across all three days.",
    },
  ];

  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-10" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-neon-lime/10 blur-[120px]"
        aria-hidden
      />

      <div className="container-fest relative max-w-4xl">
        <div className="neon-frame rounded-3xl p-6 text-center sm:p-10">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-neon-lime/30 bg-neon-lime/[0.07]">
            <CheckCircle2 className="h-8 w-8 text-neon-lime" aria-hidden />
          </span>
          <p className="eyebrow mt-6 justify-center">Registration received</p>
          <h1 className="mt-3 font-display text-4xl font-black leading-[1.04] text-white sm:text-5xl">
            You&apos;re in the <span className="text-gradient">grid.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-white/50 sm:text-base">
            Your suNRIseevent &apos;27 account and event pass have been created.
            {safeEmail ? (
              <>
                {" "}
                We sent a verification link to <span className="font-semibold text-white/80">{maskEmail(safeEmail)}</span>.
              </>
            ) : (
              " Check your inbox for the verification link."
            )}
          </p>

          {registrationId ? (
            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Pass ID</span>
              <span className="font-mono text-xs font-semibold tracking-wider text-neon-cyan">{registrationId}</span>
            </div>
          ) : null}

          <ol className="mt-9 grid gap-3 text-left sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <span className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl border border-neon-cyan/25 bg-neon-cyan/[0.06] text-neon-cyan">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
                      0{index + 1}
                    </span>
                  </span>
                  <p className="mt-3 text-[13px] font-semibold text-white/85">{step.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/40">{step.body}</p>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/login?next=/dashboard" size="lg" icon={<ArrowRight className="h-4 w-4" />}>
              Log in to your dashboard
            </Button>
            {safeEmail ? (
              <Button
                href={`/verify-email?email=${encodeURIComponent(safeEmail)}`}
                size="lg"
                variant="secondary"
                icon={<MailCheck className="h-4 w-4" />}
              >
                Resend verification
              </Button>
            ) : (
              <Button href="/verify-email" size="lg" variant="secondary">
                Resend verification
              </Button>
            )}
          </div>

          <p className="mt-6 inline-flex items-center gap-1.5 text-[11px] text-white/35">
            <ShieldCheck className="h-3.5 w-3.5 text-neon-lime" /> Your college ID stays private and is never shown
            on your pass.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-white/45">
            {FEST.fullName} · {FEST.datesLabel} · {FEST.college}, {FEST.city}
          </p>
          <Link href="/" className="text-xs font-semibold text-white/70 transition hover:text-neon-cyan">
            Back to the fest
          </Link>
        </div>
      </div>
    </section>
  );
}
