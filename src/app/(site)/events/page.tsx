import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { EventDirectory } from "@/components/events/event-directory";
import { getAllEvents, getDepartments } from "@/lib/data";
import { FEST } from "@/lib/fest";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Events",
  description: `Browse all technical, cultural, workshop and non-technical events at ${FEST.fullName}, ${FEST.college}, ${FEST.city}.`,
  alternates: { canonical: "/events" },
  openGraph: {
    title: `Events · ${FEST.fullName}`,
    description: "47+ events across three days. Filter by day, department and category.",
    url: "/events",
  },
};

export default async function EventsPage() {
  const [events, departments] = await Promise.all([getAllEvents(), getDepartments()]);
  const options = departments.map((department) => ({
    slug: department.slug,
    name: department.name,
    shortName: department.shortName,
  }));

  return (
    <>
      <PageHero
        eyebrow="The roster"
        title={
          <>
            Pick your <span className="text-gradient">battlegrounds.</span>
          </>
        }
        description="Technical sprints, cultural nights, hands-on workshops and gloriously chaotic side quests. Filter the full roster and build a line-up that fits your three days on campus."
      >
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-cyan">
            {events.length} events live
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
            {departments.length} departments
          </span>
          <span className="rounded-full border border-neon-lime/25 bg-neon-lime/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-lime">
            Max 6 events per pass
          </span>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-fest">
          <EventDirectory events={events} departments={options} />
        </div>
      </section>
    </>
  );
}
