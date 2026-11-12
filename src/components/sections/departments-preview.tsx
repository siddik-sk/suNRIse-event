import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { DepartmentCard } from "@/components/cards/department-card";
import type { PublicDepartment } from "@/lib/data";

export function DepartmentsPreview({ departments }: { departments: PublicDepartment[] }) {
  const shown = departments.slice(0, 8);

  return (
    <section className="relative section-pad" aria-labelledby="departments-heading">
      <div className="container-fest">
        <div data-gsap="fade-up">
          <SectionHeading
            eyebrow="14 departments · one grid"
            title={<span id="departments-heading">Find your people. Then build something loud.</span>}
            description="Every department runs its own arena — technical battles, hands-on workshops and gloriously chaotic non-technical events."
            action={
              <Button href="/departments" variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>
                All departments
              </Button>
            }
          />
        </div>

        {shown.length ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((department, index) => (
              <div key={department.id} data-gsap="fade-up">
                <DepartmentCard department={department} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
            Department line-up is loading. Check back shortly.
          </p>
        )}
      </div>
    </section>
  );
}
