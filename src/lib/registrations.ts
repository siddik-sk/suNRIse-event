import { Prisma } from "@prisma/client";
import QRCode from "qrcode";
import { ApiError } from "@/lib/api";
import prisma from "@/lib/prisma";
import { newQrToken, newRegistrationId, qrPayload } from "@/lib/auth/tokens";

export const registrationInclude = {
  eventRegistrations: {
    include: { event: { include: { department: true } } },
    orderBy: { event: { startTime: "asc" } },
  },
} satisfies Prisma.RegistrationInclude;

export type FullRegistration = Prisma.RegistrationGetPayload<{ include: typeof registrationInclude }>;

// ---------------------------------------------------------------------------
// Event rules
// ---------------------------------------------------------------------------

type EventSlot = { id: string; title: string; day: number; startTime: string; endTime: string; capacity: number };

function toMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/** Prevent students selecting two events that overlap on the same day. */
export function findScheduleConflict(events: EventSlot[]): string | null {
  const sorted = [...events].sort((a, b) => a.day - b.day || toMinutes(a.startTime) - toMinutes(b.startTime));
  for (let i = 0; i < sorted.length; i += 1) {
    for (let j = i + 1; j < sorted.length; j += 1) {
      if (sorted[i].day !== sorted[j].day) continue;
      if (toMinutes(sorted[j].startTime) < toMinutes(sorted[i].endTime)) {
        return `${sorted[i].title} and ${sorted[j].title} overlap. Pick one of them.`;
      }
    }
  }
  return null;
}

export async function loadSelectableEvents(eventIds: string[], client: Prisma.TransactionClient | typeof prisma = prisma) {
  const events = await client.event.findMany({
    where: { id: { in: eventIds }, isActive: true },
    select: {
      id: true,
      title: true,
      day: true,
      startTime: true,
      endTime: true,
      capacity: true,
      departmentId: true,
      venue: true,
      fee: true,
    },
  });
  if (events.length !== eventIds.length) {
    throw new ApiError(400, "One or more selected events are unavailable.", "EVENT_UNAVAILABLE");
  }
  return events;
}

async function assertCapacity(events: EventSlot[], client: Prisma.TransactionClient) {
  if (events.length === 0) return;
  const counts = await client.eventRegistration.groupBy({
    by: ["eventId"],
    where: { eventId: { in: events.map((e) => e.id) } },
    _count: { eventId: true },
  });
  const countMap = new Map(counts.map((row) => [row.eventId, row._count.eventId]));
  for (const event of events) {
    if ((countMap.get(event.id) ?? 0) >= event.capacity) {
      throw new ApiError(409, `${event.title} is full. Please choose another event.`, "EVENT_FULL");
    }
  }
}

// ---------------------------------------------------------------------------
// Registration creation
// ---------------------------------------------------------------------------

export async function createFestRegistration(userId: string, eventIds: string[]) {
  const events = await loadSelectableEvents(eventIds);
  const conflict = findScheduleConflict(events);
  if (conflict) throw new ApiError(409, conflict, "SCHEDULE_CONFLICT");

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          await assertCapacity(events, tx);
          const registration = await tx.registration.create({
            data: {
              registrationId: newRegistrationId(),
              qrToken: newQrToken(),
              userId,
              eventRegistrations: { create: eventIds.map((eventId) => ({ eventId })) },
            },
            include: registrationInclude,
          });
          return registration;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = String(error.meta?.target ?? "");
        // Retry on collision of the human-readable registration ID or QR token.
        if (target.includes("registrationId") || target.includes("qrToken")) continue;
        if (target.includes("userId")) {
          throw new ApiError(409, "You already have a fest pass.", "ALREADY_REGISTERED");
        }
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") continue;
      throw error;
    }
  }
  throw new ApiError(503, "Could not allocate a pass. Please try again.", "REGISTRATION_BUSY");
}

export async function addEventsToRegistration(userId: string, eventIds: string[]) {
  const registration = await prisma.registration.findUnique({
    where: { userId },
    include: { eventRegistrations: { include: { event: true } } },
  });
  if (!registration) throw new ApiError(404, "Complete your fest registration first.", "NO_REGISTRATION");

  const existingIds = new Set(registration.eventRegistrations.map((r) => r.eventId));
  const newIds = eventIds.filter((id) => !existingIds.has(id));
  if (newIds.length === 0) throw new ApiError(409, "You're already registered for those events.", "ALREADY_ADDED");

  const newEvents = await loadSelectableEvents(newIds);
  const allSlots: EventSlot[] = [
    ...registration.eventRegistrations.map((r) => ({
      id: r.eventId,
      title: r.event.title,
      day: r.event.day,
      startTime: r.event.startTime,
      endTime: r.event.endTime,
      capacity: r.event.capacity,
    })),
    ...newEvents,
  ];
  const conflict = findScheduleConflict(allSlots);
  if (conflict) throw new ApiError(409, conflict, "SCHEDULE_CONFLICT");

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          await assertCapacity(newEvents, tx);
          await tx.eventRegistration.createMany({
            data: newIds.map((eventId) => ({ registrationId: registration.id, eventId })),
            skipDuplicates: true,
          });
          return tx.registration.findUniqueOrThrow({ where: { id: registration.id }, include: registrationInclude });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") continue;
      throw error;
    }
  }
  throw new ApiError(503, "Could not add events. Please try again.", "REGISTRATION_BUSY");
}

export async function getRegistrationForUser(userId: string): Promise<FullRegistration | null> {
  return prisma.registration.findUnique({ where: { userId }, include: registrationInclude });
}

export async function qrDataUrlForRegistration(qrToken: string) {
  return QRCode.toDataURL(qrPayload(qrToken), {
    width: 640,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#05010d", light: "#ffffff" },
  });
}

/** Admin scanner payload → registration with attendee + events. */
export async function findRegistrationByQr(qrToken: string) {
  return prisma.registration.findUnique({
    where: { qrToken },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          college: true,
          department: true,
          year: true,
          rollNumber: true,
        },
      },
      eventRegistrations: { include: { event: { select: { id: true, title: true, day: true, startTime: true } } } },
    },
  });
}
