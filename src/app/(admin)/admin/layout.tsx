import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: {
    default: "Organizer console",
    template: "%s · suNRIseevent '27 console",
  },
  description: "Manage registrations, events, departments and check-in for suNRIseevent '27.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();

  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return <AdminShell>{children}</AdminShell>;
}
