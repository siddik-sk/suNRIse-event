import { ArrowRight, CalendarRange } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/cards/event-card";
import type { PublicEvent } from "@/lib/data";

export function EventsPreview({ events, total }: { events: PublicEvent[]; total?: number }) {
  return (
    <section className="relative section-pad" aria-labelledby="featured-events-heading">
      <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-neon-magenta/[0.07] blur-[100px]" aria-hidden />
      <div className="container-fest relative">
        <div data-gsap="fade-up">
          <SectionHeading
            eyebrow="Flagship experiences"
            title={<span id="featured-events-heading">The events people will talk about.</span>}
            description="From 24-hour builds to battle bots and a runway made of e-waste — these are the ones to clear your calendar for."
            action={
              <Button href="/events" variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>
                Browse all events
              </Button>
            }
          />
        </div>

        {events.length ? (
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} data-gsap="fade-up">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <CalendarRange className="h-8 w-8 text-neon-cyan" aria-hidden />
            <p className="mt-4 font-display text-xl text-white">The full line-up is dropping soon.</p>
            <p className="mt-2 text-sm text-white/45">Registrations open with the first wave of events.</p>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button href="/events" icon={<ArrowRight className="h-4 w-4" />}>
            See all {total || 47} events
          </Button>
        </div>
      </div>
    </section>
  );
}
