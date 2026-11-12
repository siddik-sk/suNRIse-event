import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock,
  IndianRupee,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { EventCard } from "@/components/cards/event-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/section";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getEventBySlug, getRelatedEvents } from "@/lib/data";
import { CATEGORY_COLORS, CATEGORY_LABELS, FEST, FEST_DAYS } from "@/lib/fest";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event not found" };
  const description = event.description.slice(0, 158);
  return {
    title: event.title,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: `${event.title} · ${FEST.fullName}`,
      description,
      url: `/events/${event.slug}`,
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const [event, user] = await Promise.all([getEventBySlug(slug), getAuthenticatedUser()]);

  if (!event || !event.isActive) notFound();

  const related = await getRelatedEvents(event.departmentId, event.id);
  const coordinators = (Array.isArray(event.coordinators) ? event.coordinators : []) as {
    name: string;
    phone: string;
  }[];
  const categoryColor = CATEGORY_COLORS[event.category];
  const dayInfo = FEST_DAYS[event.day - 1];
  const ctaHref = user ? "/dashboard/events" : "/register";
  const ctaLabel = user ? "Add to my pass" : "Register for this event";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: `${dayInfo?.date ?? "2027-02-19"}T${event.startTime}:00+05:30`,
    endDate: `${dayInfo?.date ?? "2027-02-19"}T${event.endTime}:00+05:30`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl(`/events/${event.slug}`),
    location: {
      "@type": "Place",
      name: `${event.venue}, ${FEST.college}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Agiripalli",
        addressLocality: FEST.city,
        addressRegion: "Andhra Pradesh",
        postalCode: "521212",
        addressCountry: "IN",
      },
    },
    organizer: { "@type": "Organization", name: FEST.college, url: absoluteUrl("/") },
    offers: {
      "@type": "Offer",
      price: String(event.fee),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/register"),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative overflow-hidden pb-14 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-15" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full blur-[130px]"
          style={{ backgroundColor: `${categoryColor}22` }}
          aria-hidden
        />

        <div className="container-fest relative">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 transition hover:text-neon-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All events
          </Link>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <Badge tone="neutral" className="border-white/15">
              {CATEGORY_LABELS[event.category]}
            </Badge>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              {event.department?.shortName}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">·</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              {dayInfo?.label ?? `Day ${event.day}`}
            </span>
            {event.isFeatured ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-neon-amber/30 bg-neon-amber/[0.07] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-neon-amber">
                <Sparkles className="h-3 w-3" /> Featured
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 max-w-4xl text-balance font-display text-[clamp(2.2rem,6vw,4.4rem)] font-black leading-[0.98] text-white">
            {event.title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/55 sm:text-lg">
            {event.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button href={ctaHref} icon={<ArrowUpRight className="h-4 w-4" />}>
              {ctaLabel}
            </Button>
            <Button href="/schedule" variant="secondary" icon={<CalendarDays className="h-4 w-4" />}>
              Full schedule
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-fest grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <div className="space-y-6">
            <div className="neon-frame rounded-2xl p-5 sm:p-7">
              <h2 className="font-display text-xl font-bold text-white">What to expect</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{event.description}</p>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Detail icon={CalendarDays} label="Day" value={`Day ${event.day} · ${dayInfo?.date ?? ""}`} />
                <Detail icon={Clock} label="Time" value={`${event.startTime} – ${event.endTime}`} />
                <Detail icon={MapPin} label="Venue" value={event.venue} />
                <Detail icon={Trophy} label="Prize pool" value={event.prize} />
                <Detail icon={Users} label="Team size" value={`${event.teamSize} members`} />
                <Detail
                  icon={IndianRupee}
                  label="Entry fee"
                  value={event.fee > 0 ? `₹${event.fee} per participant` : "Free with fest pass"}
                />
              </dl>
            </div>

            {event.rules.length > 0 ? (
              <div className="neon-frame rounded-2xl p-5 sm:p-7">
                <h2 className="font-display text-xl font-bold text-white">Rules &amp; format</h2>
                <ol className="mt-4 space-y-3">
                  {event.rules.map((rule, index) => (
                    <li key={rule} className="flex gap-3 text-sm leading-relaxed text-white/60">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-neon-cyan/30 bg-neon-cyan/[0.07] font-mono text-[9px] text-neon-cyan">
                        {index + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ol>
                <p className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-white/45">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-lime" />
                  All participants must carry a valid college ID and follow the fest code of conduct. Decisions of the
                  judges are final.
                </p>
              </div>
            ) : null}

            {coordinators.length > 0 ? (
              <div className="neon-frame rounded-2xl p-5 sm:p-7">
                <h2 className="font-display text-xl font-bold text-white">Event coordinators</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {coordinators.map((coordinator) => (
                    <a
                      key={`${coordinator.name}-${coordinator.phone}`}
                      href={`tel:+91${coordinator.phone}`}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-neon-cyan/30 hover:bg-white/[0.05]"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-neon-magenta to-neon-purple font-mono text-xs font-bold text-white">
                        {coordinator.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-white/85">{coordinator.name}</span>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-white/40">
                          <Phone className="h-3 w-3" /> +91 {coordinator.phone}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="neon-frame rounded-2xl p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">At a glance</p>
              <p className="mt-2 font-display text-2xl font-black text-white">
                {event.fee > 0 ? `₹${event.fee}` : "Free"}
              </p>
              <p className="text-xs text-white/40">{event.fee > 0 ? "Per participant" : "With your fest pass"}</p>

              <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4 text-xs">
                <Row label="Capacity" value={`${event.capacity} seats`} />
                <Row label="Team" value={event.teamSize} />
                <Row label="Department" value={event.department?.shortName ?? "—"} />
                <Row label="Day" value={`Day ${event.day}`} />
              </div>

              <Button href={ctaHref} className="mt-5 w-full" size="sm" icon={<ArrowUpRight className="h-3.5 w-3.5" />}>
                {user ? "Add to my pass" : "Register now"}
              </Button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Venue</p>
              <p className="mt-2 text-sm font-semibold text-white/85">{event.venue}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/45">
                {FEST.college}, Agiripalli, near {FEST.city}
              </p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${event.venue}, ${FEST.venueMapQuery}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-neon-cyan hover:underline"
              >
                Open in Maps <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-t border-white/10 py-16">
          <div className="container-fest">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">More from {event.department?.shortName}</p>
                <h2 className="font-display text-2xl font-black text-white sm:text-3xl">Keep the streak going.</h2>
              </div>
              <Link
                href={`/departments/${event.department?.slug ?? ""}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-neon-cyan hover:underline"
              >
                Department hub <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <EventCard key={item.id} event={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/25" />
      <div className="min-w-0">
        <dt className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/30">{label}</dt>
        <dd className="mt-0.5 text-sm text-white/75">{value}</dd>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/40">{label}</span>
      <span className="font-medium text-white/75">{value}</span>
    </div>
  );
}
