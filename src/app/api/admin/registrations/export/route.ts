import { withApi } from "@/lib/api";
import { buildRegistrationWhere } from "@/lib/admin-filters";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  let text = String(value ?? "").replace(/\r?\n/g, " ").trim();
  // Prevent CSV formula injection when opened in Excel/Sheets.
  if (/^[=+\-@\t]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** GET /api/admin/registrations/export — filtered CSV download. */
export const GET = withApi(async (req) => {
  await requireAdmin(req);

  const url = new URL(req.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const where = buildRegistrationWhere(raw);

  const rows = await prisma.registration.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          college: true,
          department: true,
          year: true,
          rollNumber: true,
        },
      },
      eventRegistrations: {
        include: { event: { select: { title: true, day: true, startTime: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10_000,
  });

  const headers = [
    "Registration ID",
    "Name",
    "Email",
    "Phone",
    "College",
    "Department",
    "Year",
    "Roll Number",
    "Events",
    "Checked In",
    "Checked In At",
    "Registered At",
  ];

  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) {
    const events = row.eventRegistrations
      .map(({ event }) => `D${event.day} ${event.startTime} ${event.title}`)
      .join(" | ");
    lines.push(
      [
        row.registrationId,
        row.user.name,
        row.user.email,
        row.user.phone,
        row.user.college,
        row.user.department,
        row.user.year,
        row.user.rollNumber,
        events,
        row.checkedInAt ? "Yes" : "No",
        row.checkedInAt?.toISOString() ?? "",
        row.createdAt.toISOString(),
      ]
        .map(csvCell)
        .join(","),
    );
  }

  const csv = `\uFEFF${lines.join("\r\n")}`;
  const filename = `sunriseevent-registrations-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
});
