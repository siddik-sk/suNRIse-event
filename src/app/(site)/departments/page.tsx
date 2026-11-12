import type { Metadata } from "next";
import { ArrowUpRight, Building2, CalendarDays } from "lucide-react";
import { DepartmentCard } from "@/components/cards/department-card";
import { PageHero } from "@/components/sections/page-hero";
import { Button } from "@/components/ui/button";
import { getDepartments } from "@/lib/data";
import { FEST } from "@/lib/fest";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Departments",
  description: `Explore the ${FEST.college} departments hosting events at ${FEST.fullName}.`,
  alternates: { canonical: "/departments" },
  openGraph: {
    title: `Departments · ${FEST.fullName}`,
    description: "Fourteen departments, one festival. Find your people.",
    url: "/departments",
  },
};

export default async function DepartmentsPage() {
  const departments = await getDepartments();
  const totalEvents = departments.reduce((total, department) => total + department._count.events, 0);

  return (
    <>
      <PageHero
        eyebrow="The departments"
        title={
          <>
            Fourteen crews. <span className="text-gradient">One grid.</span>
          </>
        }
        description="Every department brings its own arena, its own judges and its own brand of chaos. Explore the hosts, then dive into their events."
      >
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/25 bg-neon-cyan/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-cyan">
            <Building2 className="h-3 w-3" /> {departments.length} departments
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">
            <CalendarDays className="h-3 w-3" /> {totalEvents} events
          </span>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-fest">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {departments.map((department, index) => (
              <DepartmentCard key={department.id} department={department} index={index} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-lg font-bold text-white">Not sure where to start?</p>
              <p className="mt-1 text-sm text-white/45">
                Browse every event in one place and filter by day, department or category.
              </p>
            </div>
            <Button href="/events" size="sm" icon={<ArrowUpRight className="h-3.5 w-3.5" />}>
              Explore all events
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
