import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Trophy, Users } from "lucide-react";
import { EventCard } from "@/components/cards/event-card";
import { Button } from "@/components/ui/button";
import { getDepartmentBySlug } from "@/lib/data";
import { FEST } from "@/lib/fest";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);
  if (!department) return { title: "Department not found" };
  return {
    title: department.name,
    description: department.description,
    alternates: { canonical: `/departments/${department.slug}` },
    openGraph: {
      title: `${department.name} · ${FEST.fullName}`,
      description: department.description,
      url: `/departments/${department.slug}`,
    },
  };
}

export default async function DepartmentDetailPage({ params }: Props) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);
  if (!department || !department.isActive) notFound();

  const eventCount = department.events.length;
  const prizeCount = department.events.filter((event) => event.prize.toLowerCase().includes("₹")).length;

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/[0.06] pb-14 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-15" aria-hidden />
        <div
          className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-neon-purple/20 blur-[130px]"
          aria-hidden
        />

        <div className="container-fest relative">
          <Link
            href="/departments"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 transition hover:text-neon-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All departments
          </Link>

          <p className="eyebrow mb-4 mt-7">{department.shortName} · Host department</p>
          <h1 className="max-w-4xl text-balance font-display text-[clamp(2.1rem,6vw,4.2rem)] font-black leading-[0.98] text-white">
            {department.name}
          </h1>
          {department.tagline ? (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.24em] text-neon-cyan/80">
              {department.tagline}
            </p>
          ) : null}
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-white/55 sm:text-lg">
            {department.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-cyan">
              <CalendarDays className="h-3 w-3" /> {eventCount} events
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-amber/25 bg-neon-amber/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-amber">
              <Trophy className="h-3 w-3" /> {prizeCount} prize events
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
              <Users className="h-3 w-3" /> Open to all colleges
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Button href="/register" size="sm">
              Register for the fest
            </Button>
            <Button href="/events" size="sm" variant="secondary">
              Browse all events
            </Button>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-fest">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">The line-up</p>
              <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
                {department.shortName} events.
              </h2>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
              {FEST.datesLabel}
            </p>
          </div>

          {eventCount === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
              <p className="text-sm font-semibold text-white/70">No events announced yet.</p>
              <p className="mt-1 text-xs text-white/40">Check back soon — the roster is still filling up.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {department.events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: department.name,
            description: department.description,
            url: absoluteUrl(`/departments/${department.slug}`),
            parentOrganization: { "@type": "CollegeOrUniversity", name: FEST.college },
          }),
        }}
      />
    </>
  );
}
