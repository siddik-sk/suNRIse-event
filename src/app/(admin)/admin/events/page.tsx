import type { Metadata } from "next";
import { EventsManager } from "@/components/admin/events-manager";

export const metadata: Metadata = {
  title: "Events",
};

export default function AdminEventsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-3">Events</p>
        <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
          Shape the <span className="text-gradient">line-up.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
          Create events, adjust capacity, publish or hide them from the public roster. Changes are live immediately.
        </p>
      </header>

      <EventsManager />
    </div>
  );
}
