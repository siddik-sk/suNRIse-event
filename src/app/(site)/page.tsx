import type { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about-section";
import { HighlightsSection } from "@/components/sections/highlights-section";
import { DepartmentsPreview } from "@/components/sections/departments-preview";
import { EventsPreview } from "@/components/sections/events-preview";
import { SchedulePreview } from "@/components/sections/schedule-preview";
import { Gallery } from "@/components/sections/gallery";
import { SponsorsSection } from "@/components/sections/sponsors-section";
import { CtaSection } from "@/components/sections/cta-section";
import { getDepartments, getFeaturedEvents, getAllEvents } from "@/lib/data";
import { FEST } from "@/lib/fest";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `${FEST.fullName} — ${FEST.tagline}`,
  description: FEST.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [departments, featured, events] = await Promise.all([
    getDepartments(),
    getFeaturedEvents(6),
    getAllEvents(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: FEST.fullName,
    description: FEST.description,
    startDate: FEST.startDate,
    endDate: FEST.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: absoluteUrl("/"),
    image: absoluteUrl("/opengraph-image"),
    location: {
      "@type": "Place",
      name: FEST.college,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Agiripalli",
        addressLocality: FEST.city,
        postalCode: "521212",
        addressRegion: "Andhra Pradesh",
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "Organization",
      name: FEST.college,
      url: absoluteUrl("/"),
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/register"),
      validFrom: "2026-11-01T00:00:00+05:30",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero eventCount={events.length} />
      <AboutSection />
      <HighlightsSection />
      <DepartmentsPreview departments={departments} />
      <EventsPreview events={featured} total={events.length} />
      <SchedulePreview events={events} />
      <Gallery />
      <SponsorsSection />
      <CtaSection />
    </>
  );
}
