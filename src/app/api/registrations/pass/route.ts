import { ApiError, json, withApi } from "@/lib/api";
import { requireVerifiedUser } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { qrDataUrlForRegistration, registrationInclude } from "@/lib/registrations";
import { rateLimitOrThrow } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireVerifiedUser(req);
  rateLimitOrThrow(`pass:${user.id}`, 60, 15 * 60 * 1000);

  const registration = await prisma.registration.findUnique({
    where: { userId: user.id },
    include: registrationInclude,
  });
  if (!registration) throw new ApiError(404, "No fest pass found for this account.", "NO_REGISTRATION");

  const dataUrl = await qrDataUrlForRegistration(registration.qrToken);

  return json({
    ok: true,
    registrationId: registration.registrationId,
    status: registration.status,
    checkedInAt: registration.checkedInAt,
    dataUrl,
    events: registration.eventRegistrations.map(({ event, attended }) => ({
      id: event.id,
      title: event.title,
      day: event.day,
      startTime: event.startTime,
      endTime: event.endTime,
      venue: event.venue,
      attended,
    })),
  });
});
