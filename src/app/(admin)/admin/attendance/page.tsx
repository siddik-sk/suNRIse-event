import type { Metadata } from "next";
import { AttendanceScanner } from "@/components/admin/attendance-scanner";

export const metadata: Metadata = {
  title: "Attendance scanner",
};

export default function AdminAttendancePage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow mb-3">Gate desk</p>
        <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
          Scan, verify, <span className="text-gradient">let them in.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">
          Use a phone or laptop camera to read the QR pass, or paste the pass ID when a screen will not scan. Event
          attendance is marked separately from gate check-in.
        </p>
      </header>

      <AttendanceScanner />
    </div>
  );
}
