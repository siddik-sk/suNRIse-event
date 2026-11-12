import { Prisma, type EventCategory } from "@prisma/client";
import prisma from "@/lib/prisma";
import { eventQuerySchema } from "@/lib/validation/schemas";

export const eventInclude = {
  department: { select: { id: true, slug: true, name: true, shortName: true, accent: true, icon: true } },
} satisfies Prisma.EventInclude;

export type PublicEvent = Prisma.EventGetPayload<{ include: typeof eventInclude }>;
export type PublicDepartment = Prisma.DepartmentGetPayload<{
  include: { _count: { select: { events: true } } };
}>;

export async function getDepartments(): Promise<PublicDepartment[]> {
  try {
    return await prisma.department.findMany({
      where: { isActive: true },
      include: { _count: { select: { events: { where: { isActive: true } } } } },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    console.error("[data] departments failed", error instanceof Error ? error.message : "unknown");
    return [];
  }
}

export async function getFeaturedEvents(limit = 6): Promise<PublicEvent[]> {
  try {
    return await prisma.event.findMany({
      where: { isActive: true, isFeatured: true },
      include: eventInclude,
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getEvents(filters: Partial<{ q: string; department: string; category: EventCategory; day: number }> = {}) {
  const where: Prisma.EventWhereInput = { isActive: true };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
      { venue: { contains: filters.q, mode: "insensitive" } },
      { department: { name: { contains: filters.q, mode: "insensitive" } } },
    ];
  }
  if (filters.department) where.department = { slug: filters.department };
  if (filters.category) where.category = filters.category;
  if (filters.day) where.day = filters.day;

  try {
    return await prisma.event.findMany({
      where,
      include: eventInclude,
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string) {
  try {
    return await prisma.event.findUnique({ where: { slug }, include: eventInclude });
  } catch {
    return null;
  }
}

export async function getRelatedEvents(departmentId: string, excludeId: string, limit = 3) {
  try {
    return await prisma.event.findMany({
      where: { departmentId, isActive: true, id: { not: excludeId } },
      include: eventInclude,
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getDepartmentBySlug(slug: string) {
  try {
    return await prisma.department.findUnique({
      where: { slug },
      include: {
        events: {
          where: { isActive: true },
          orderBy: [{ day: "asc" }, { startTime: "asc" }],
          include: eventInclude,
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getAllEvents() {
  try {
    return await prisma.event.findMany({
      where: { isActive: true },
      include: eventInclude,
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    });
  } catch {
    return [];
  }
}

export async function getFestStats() {
  try {
    const [events, departments, registrations, colleges] = await Promise.all([
      prisma.event.count({ where: { isActive: true } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.registration.count({ where: { status: "CONFIRMED" } }),
      prisma.user.findMany({ where: { role: "STUDENT" }, distinct: ["college"], select: { college: true } }),
    ]);
    return {
      events,
      departments,
      registrations,
      colleges: Math.max(colleges.length, 40),
    };
  } catch {
    return { events: 60, departments: 14, registrations: 0, colleges: 40 };
  }
}

/** Shared query parser for /api/events and server pages. */
export function parseEventFilters(searchParams: URLSearchParams) {
  const raw = {
    q: searchParams.get("q") ?? undefined,
    department: searchParams.get("department") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    day: searchParams.get("day") ?? undefined,
  };
  const parsed = eventQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : {};
}
