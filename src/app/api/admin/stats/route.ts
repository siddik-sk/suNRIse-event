import { json, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/stats — dashboard aggregates. Admin only. */
export const GET = withApi(async (req) => {
  await requireAdmin(req);

  const [students, registrations, checkedIn, colleges, eventRegistrations, departments, events, recent] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.registration.count({ where: { status: "CONFIRMED" } }),
      prisma.registration.count({ where: { checkedInAt: { not: null } } }),
      prisma.user.findMany({ where: { role: "STUDENT" }, distinct: ["college"], select: { college: true } }),
      prisma.eventRegistration.findMany({
        select: { eventId: true, attended: true, event: { select: { fee: true, category: true, departmentId: true } } },
      }),
      prisma.department.findMany({ select: { id: true, name: true, shortName: true, accent: true } }),
      prisma.event.findMany({ select: { id: true, category: true } }),
      prisma.registration.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    ]);

  const revenue = eventRegistrations.reduce((total, row) => total + (row.event.fee || 0), 0);
  const attendedCount = eventRegistrations.filter((row) => row.attended).length;

  // Last 7 days trend
  const days: { date: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({
      date: key,
      label: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
      count: recent.filter((row) => row.createdAt.toISOString().slice(0, 10) === key).length,
    });
  }

  const categoryMap = new Map<string, number>();
  for (const event of events) categoryMap.set(event.category, (categoryMap.get(event.category) ?? 0) + 1);
  const byCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

  const deptMap = new Map<string, { events: number; registrations: number }>();
  for (const department of departments) deptMap.set(department.id, { events: 0, registrations: 0 });
  const eventToDept = new Map<string, string>();
  const allEvents = await prisma.event.findMany({ select: { id: true, departmentId: true } });
  for (const event of allEvents) eventToDept.set(event.id, event.departmentId);
  for (const event of allEvents) {
    const row = deptMap.get(event.departmentId);
    if (row) row.events += 1;
  }
  for (const registration of eventRegistrations) {
    const deptId = eventToDept.get(registration.eventId);
    if (!deptId) continue;
    const row = deptMap.get(deptId);
    if (row) row.registrations += 1;
  }
  const byDepartment = departments
    .map((department) => ({
      name: department.shortName,
      fullName: department.name,
      accent: department.accent,
      ...(deptMap.get(department.id) ?? { events: 0, registrations: 0 }),
    }))
    .sort((a, b) => b.registrations - a.registrations);

  const topEvents = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      day: true,
      capacity: true,
      department: { select: { shortName: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { registrations: { _count: "desc" } },
    take: 6,
  });

  const categoryTotals = {
    TECHNICAL: 0,
    NON_TECHNICAL: 0,
    WORKSHOP: 0,
    CULTURAL: 0,
  } as Record<string, number>;
  for (const registration of eventRegistrations) {
    categoryTotals[registration.event.category] = (categoryTotals[registration.event.category] ?? 0) + 1;
  }

  return json({
    ok: true,
    stats: {
      students,
      registrations,
      checkedIn,
      attendanceRate: registrations ? Math.round((checkedIn / registrations) * 100) : 0,
      colleges: colleges.length,
      revenue,
      eventRegistrations: eventRegistrations.length,
      attendedEvents: attendedCount,
      departments: departments.length,
      events: events.length,
      trend: days,
      byCategory,
      categoryTotals,
      byDepartment,
      topEvents: topEvents.map((event) => ({
        id: event.id,
        title: event.title,
        day: event.day,
        department: event.department.shortName,
        capacity: event.capacity,
        registrations: event._count.registrations,
        fill: event.capacity ? Math.min(100, Math.round((event._count.registrations / event.capacity) * 100)) : 0,
      })),
    },
  });
});
