import type { Prisma } from "@prisma/client";
import { ApiError, assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import { parseQrPayload } from "@/lib/auth/tokens";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { rateLimitOrThrow } from "@/lib/security/rate-limit";
import { attendanceSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const scanInclude = {
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
  eventRegistrations: {
    include: { event: { select: { id: true, title: true, day: true, startTime: true, venue: true } } },
    orderBy: { event: { startTime: "asc" } },
  },
} satisfies Prisma.RegistrationInclude;

/** POST /api/admin/attendance — scan or paste a pass QR / registration ID. */
export const POST = withApi(async (req) => {
  assertCsrf(req);
  const admin = await requireAdmin(req);
  rateLimitOrThrow(`attendance:${admin.id}`, 120, 5 * 60 * 1000);

  const input = await parseJson(req, attendanceSchema);
  const raw = input.qr.trim();

  let registration;

  if (/^SUN27-[A-Z0-9]+$/i.test(raw)) {
    registration = await prisma.registration.findUnique({
      where: { registrationId: raw.toUpperCase() },
      include: scanInclude,
    });
  } else {
    const token = parseQrPayload(raw);
    if (!token) throw new ApiError(400, "That QR code is not a suNRIseevent pass.", "INVALID_QR");
    registration = await prisma.registration.findUnique({
      where: { qrToken: token },
      include: scanInclude,
    });
  }

  if (!registration) throw new ApiError(404, "Pass not found. Check the QR or registration ID.", "PASS_NOT_FOUND");

  let markedEvent: { id: string; title: string; day: number; startTime: string } | null = null;
  let alreadyAttended = false;

  if (input.eventId) {
    const registrationEvent = registration.eventRegistrations.find((row) => row.eventId === input.eventId);
    if (!registrationEvent) {
      throw new ApiError(409, "This student is not registered for the selected event.", "NOT_REGISTERED");
    }

    alreadyAttended = registrationEvent.attended;
    if (!alreadyAttended) {
      await prisma.eventRegistration.update({
        where: { id: registrationEvent.id },
        data: { attended: true, attendedAt: new Date() },
      });
      markedEvent = registrationEvent.event;
    } else {
      markedEvent = registrationEvent.event;
    }
  }

  if (!registration.checkedInAt) {
    await prisma.registration.update({ where: { id: registration.id }, data: { checkedInAt: new Date() } });
  }

  await logSecurityEvent({
    action: "ATTENDANCE_MARKED",
    detail: `${registration.registrationId}${input.eventId ? ` · event ${input.eventId}` : " · general check-in"}`,
    req,
  });

  return json({
    ok: true,
    alreadyAttended,
    registration: {
      id: registration.id,
      registrationId: registration.registrationId,
      checkedInAt: registration.checkedInAt ?? new Date(),
      user: registration.user,
      events: registration.eventRegistrations.map((row) => ({
        id: row.event.id,
        title: row.event.title,
        day: row.event.day,
        startTime: row.event.startTime,
        venue: row.event.venue,
        attended: row.eventId === input.eventId ? true : row.attended,
      })),
    },
    markedEvent,
  });
});
