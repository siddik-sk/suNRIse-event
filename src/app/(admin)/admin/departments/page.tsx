import type { Metadata } from "next";
import { DepartmentsManager } from "@/components/admin/departments-manager";

export const metadata: Metadata = {
  title: "Departments",
};

export default function AdminDepartmentsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-3">Departments</p>
        <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
          The host <span className="text-gradient">departments.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
          Each department owns its events, accent colour and public hub page. Reorder them to control the site.
        </p>
      </header>

      <DepartmentsManager />
    </div>
  );
}
