import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarClock, ShieldCheck, Sparkles } from "lucide-react";
import { RegisterForm, type RegisterEventOption } from "@/components/forms/register-form";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getAllEvents } from "@/lib/data";
import { FEST } from "@/lib/fest";

export const metadata: Metadata = {
  title: "Register for your pass",
  description:
    "Create your suNRIseevent '27 pass, upload your college ID and pick up to six events across three days at NRI University, Vijayawada.",
  alternates: { canonical: "/register" },
  openGraph: {
    title: `Register · ${FEST.fullName}`,
    description: "One pass. Three days. Pick your events and join the grid.",
    url: "/register",
  },
};

export default async function RegisterPage() {
  // Registered students manage their pass from the dashboard instead.
  const user = await getAuthenticatedUser();
  if (user) redirect("/dashboard");

  const events = await getAllEvents();
  const options: RegisterEventOption[] = events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    category: event.category,
    day: event.day,
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    fee: event.fee,
    capacity: event.capacity,
    teamSize: event.teamSize,
    department: event.department?.name ?? "suNRIseevent",
    departmentShort: event.department?.shortName ?? "NOVA",
  }));

  return (
    <section className="relative overflow-hidden pb-20 pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-15" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-neon-purple/20 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-neon-magenta/15 blur-[120px]"
        aria-hidden
      />

      <div className="container-fest relative">
        <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neon-lime/25 bg-neon-lime/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-neon-lime">
            <CalendarClock className="h-3 w-3" /> Registration closes 15 Feb 2027
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">
            <ShieldCheck className="h-3 w-3 text-neon-cyan" /> Verified students only
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">
            <Sparkles className="h-3 w-3 text-neon-amber" /> {options.length} events live
          </span>
        </div>

        <RegisterForm events={options} />
      </div>
    </section>
  );
}
