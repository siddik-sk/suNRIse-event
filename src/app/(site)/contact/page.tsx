import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/sections/page-hero";
import { FEST } from "@/lib/fest";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${FEST.fullName} team at ${FEST.college}, ${FEST.city}.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact · ${FEST.fullName}`,
    description: "Questions, sponsorship, press or accessibility — reach a human.",
    url: "/contact",
  },
};

const details = [
  { icon: Mail, label: "Email", value: FEST.email, href: `mailto:${FEST.email}` },
  { icon: Phone, label: "Phone", value: FEST.phone, href: `tel:${FEST.phone.replace(/[^\d+]/g, "")}` },
  { icon: MapPin, label: "Venue", value: FEST.venue, href: null },
  { icon: Clock, label: "Help desk hours", value: "Mon–Sat · 9 AM – 6 PM IST", href: null },
];

export default function ContactPage() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(FEST.venueMapQuery)}&output=embed`;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Reach a <span className="text-gradient">real human.</span>
          </>
        }
        description="Registration trouble, sponsorship decks, press passes, accessibility requests or a genuinely good idea — the inbox is monitored daily."
      />

      <section className="section-pad">
        <div className="container-fest grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
          <ContactForm />

          <aside className="space-y-4">
            <div className="neon-frame rounded-2xl p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">Direct lines</p>
              <ul className="mt-4 space-y-3">
                {details.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-neon-cyan">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">{label}</p>
                      {href ? (
                        <a href={href} className="mt-0.5 block break-words text-sm text-white/80 hover:text-neon-cyan">
                          {value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm leading-relaxed text-white/70">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
              <iframe
                title={`Map showing ${FEST.college}`}
                src={mapSrc}
                width="100%"
                height="240"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block border-0 grayscale-[0.35] contrast-[1.05]"
              />
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-white/85">{FEST.college}</p>
                  <p className="mt-0.5 text-xs text-white/40">Agiripalli, near {FEST.city}, Andhra Pradesh</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FEST.venueMapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neon-cyan hover:underline"
                >
                  <Send className="h-3.5 w-3.5" /> Maps
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Press &amp; sponsors</p>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Use the subject “Sponsorship” or “Press” and the right lead will pick it up. Sponsorship decks are sent
                within two working days.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
