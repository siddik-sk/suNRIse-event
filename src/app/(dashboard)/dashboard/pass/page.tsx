import type { Metadata } from "next";
import { CalendarDays, QrCode, ShieldCheck } from "lucide-react";
import { PassPanel } from "@/components/dashboard/pass-panel";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My pass",
  description: "Your suNRIseevent '27 QR pass.",
};

export default function DashboardPassPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">My pass</p>
          <h1 className="font-display text-3xl font-black leading-tight text-white sm:text-4xl">
            One QR. <span className="text-gradient">All three days.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
            Download a copy before you travel, keep it on your phone and carry your college ID for verification at the
            gate.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/dashboard/events" size="sm" variant="secondary" icon={<CalendarDays className="h-3.5 w-3.5" />}>
            Manage events
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Tip icon={QrCode} title="Works offline" text="Screenshot or download the PNG. The gate scanner reads it without internet on your phone." />
        <Tip icon={ShieldCheck} title="Non-transferable" text="Your pass is tied to your account and college ID. Sharing it will fail at check-in." />
        <Tip icon={CalendarDays} title="One pass, three days" text="The same QR is valid for 19–21 February 2027. Each event is tracked separately." />
      </div>

      <PassPanel full />
    </div>
  );
}

function Tip({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-neon-cyan">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-sm font-semibold text-white/85">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-white/40">{text}</p>
    </div>
  );
}
