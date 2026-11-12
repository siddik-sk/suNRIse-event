import type { Metadata } from "next";
import { OverviewDashboard } from "@/components/admin/overview-dashboard";

export const metadata: Metadata = {
  title: "Overview",
};

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Command deck</p>
          <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
            The fest, <span className="text-gradient">at a glance.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
            Live registration, capacity and attendance numbers for suNRIseevent &apos;27.
          </p>
        </div>
      </header>

      <OverviewDashboard />
    </div>
  );
}
