import type { Metadata } from "next";
import { PageHero } from "@/components/sections/page-hero";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { getAllEvents, getDepartments } from "@/lib/data";
import { FEST } from "@/lib/fest";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Schedule",
  description: `The full three-day schedule for ${FEST.fullName} at ${FEST.college}, ${FEST.city}.`,
  alternates: { canonical: "/schedule" },
  openGraph: {
    title: `Schedule · ${FEST.fullName}`,
    description: "Three days, three stages, one relentless line-up.",
    url: "/schedule",
  },
};

export default async function SchedulePage() {
  const [events, departments] = await Promise.all([getAllEvents(), getDepartments()]);
  const options = departments.map((department) => ({
    slug: department.slug,
    name: department.name,
    shortName: department.shortName,
  }));

  return (
    <>
      <PageHero
        eyebrow="19–21 February 2027"
        title={
          <>
            Three days. <span className="text-gradient">Zero dead air.</span>
          </>
        }
        description="Plan your run. Filter by day, department or category, then print a copy for the hostel wall. Doors open at 8 AM each morning."
      >
        <div className="flex flex-wrap gap-2">
          {FEST.stats.slice(0, 3).map((stat) => (
            <span
              key={stat.label}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-white/50"
            >
              {stat.value} {stat.label}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-fest">
          <ScheduleView events={events} departments={options} />
        </div>
      </section>
    </>
  );
}
