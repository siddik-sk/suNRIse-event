import type { Metadata } from "next";
import { RegistrationsTable } from "@/components/admin/registrations-table";

export const metadata: Metadata = {
  title: "Registrations",
};

export default function AdminRegistrationsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-3">Registrations</p>
        <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
          Every pass, <span className="text-gradient">filterable.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
          Search the roster, inspect event selections, verify college IDs and export a filtered CSV for the desk.
        </p>
      </header>

      <RegistrationsTable />
    </div>
  );
}
