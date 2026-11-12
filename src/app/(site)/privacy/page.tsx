import type { Metadata } from "next";
import { Lock, Mail } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { FEST } from "@/lib/fest";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${FEST.fullName} collects, uses and protects participant data.`,
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    title: "What we collect",
    body: [
      "Account details you provide when registering: name, email address, mobile number, college, department, year of study and roll number.",
      "A college ID image or PDF that you upload for verification. This file is stored privately and is only viewable by authorised fest organizers.",
      "Your event selections, QR pass, check-in timestamps and attendance records.",
      "Basic technical data such as IP address and browser user agent, used for security, rate limiting and fraud prevention.",
      "Messages you send through the contact form.",
    ],
  },
  {
    title: "Why we collect it",
    body: [
      "To create and manage your fest pass, verify that you are a currently enrolled student, and allocate event seats.",
      "To run check-in and attendance at the venue, including scanning your QR pass.",
      "To send transactional email such as verification links, password resets, pass details and essential fest updates.",
      "To keep the platform secure, investigate abuse and comply with legal obligations.",
      "To produce anonymised aggregate statistics for reporting and sponsorship.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "Account and registration data is retained for the duration of the fest and up to 12 months afterwards for audit and dispute resolution.",
      "Uploaded college IDs are deleted within 90 days after the fest ends unless a legal or disciplinary hold applies.",
      "Contact messages are retained for up to 12 months.",
      "Security and audit logs are retained for up to 12 months.",
    ],
  },
  {
    title: "Who can see it",
    body: [
      "Authorised fest organizers with an admin account can view registration details, college ID uploads and attendance status.",
      "Event coordinators may receive the participant list for their specific event, limited to the details needed to run it.",
      "We use service providers for email delivery, hosting, database and bot protection. They process data only on our instructions.",
      "We do not sell personal data, and we do not share it with sponsors in identifiable form.",
    ],
  },
  {
    title: "Cookies and local storage",
    body: [
      "We use strictly necessary cookies for authentication, session rotation and CSRF protection. These are httpOnly where possible and cannot be disabled without breaking login.",
      "A non-httpOnly CSRF cookie is set so the browser can echo the token with state-changing requests.",
      "Session storage may remember that the intro animation has already played for the current tab.",
      "We do not use advertising cookies or third-party analytics trackers.",
    ],
  },
  {
    title: "Security",
    body: [
      "Passwords are hashed with bcrypt and never stored in plain text.",
      "Access tokens are short-lived; refresh tokens rotate on every use, and reuse revokes the session family.",
      "Uploads are validated by magic bytes, renamed and stored outside the public web root.",
      "All traffic should be served over HTTPS in production. Security headers include CSP, HSTS, nosniff and frame denial.",
    ],
  },
  {
    title: "Your choices",
    body: [
      "You can update your profile details from the student dashboard.",
      "You can request a copy, correction or deletion of your data by emailing us. Deletion requests are actioned after the fest closes unless there is a lawful reason to retain the record.",
      "You can unsubscribe from non-essential email at any time; transactional messages about your pass and security cannot be disabled while you hold an account.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Privacy"
        title={
          <>
            Your data, <span className="text-gradient">handled carefully.</span>
          </>
        }
        description="We collect the minimum needed to run a safe, fair festival. This page explains exactly what that means in practice."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-lime/25 bg-neon-lime/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-lime">
          <Lock className="h-3 w-3" /> No ads. No data selling.
        </span>
      </PageHero>

      <section className="section-pad">
        <div className="container-fest max-w-4xl space-y-5">
          {sections.map((section, index) => (
            <div key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[10px] tracking-[0.2em] text-neon-cyan/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-xl font-bold text-white">{section.title}</h2>
              </div>
              <ul className="mt-4 space-y-2.5">
                {section.body.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-white/55">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neon-cyan/60" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-2xl border border-neon-cyan/20 bg-neon-cyan/[0.04] p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-white">Questions or requests</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              Email the data protection contact for access, correction or deletion requests. Include the email address
              on your fest account so we can verify ownership.
            </p>
            <a
              href={`mailto:${FEST.email}?subject=Privacy%20request`}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neon-cyan hover:underline"
            >
              <Mail className="h-4 w-4" /> {FEST.email}
            </a>
          </div>

          <p className="text-center font-mono text-[9px] uppercase tracking-[0.22em] text-white/25">
            Effective {FEST.datesLabel} · {FEST.college}
          </p>
        </div>
      </section>
    </>
  );
}
