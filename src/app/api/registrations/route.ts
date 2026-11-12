import { assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { requireVerifiedUser } from "@/lib/auth/session";
import { addEventsToRegistration, getRegistrationForUser } from "@/lib/registrations";
import { logSecurityEvent } from "@/lib/security/audit";
import { rateLimitOrThrow } from "@/lib/security/rate-limit";
import { addEventsSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function publicRegistration(registration: NonNullable<Awaited<ReturnType<typeof getRegistrationForUser>>>) {
  const { qrToken: _qrToken, ...safe } = registration;
  return safe;
}

export const GET = withApi(async (req) => {
  const user = await requireVerifiedUser(req);
  const registration = await getRegistrationForUser(user.id);
  if (!registration) return json({ ok: true, registration: null });
  return json({ ok: true, registration: publicRegistration(registration) });
});

export const POST = withApi(async (req) => {
  assertCsrf(req);
  const user = await requireVerifiedUser(req);
  rateLimitOrThrow(`add-events:${user.id}`, 20, 60 * 60 * 1000);

  const { eventIds } = await parseJson(req, addEventsSchema);
  const registration = await addEventsToRegistration(user.id, eventIds);

  await logSecurityEvent({
    action: "EVENTS_ADDED",
    detail: `${eventIds.length} event(s) added to ${registration.registrationId}.`,
    userId: user.id,
    req,
  });

  return json({ ok: true, registration: publicRegistration(registration) });
});
