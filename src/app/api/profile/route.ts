import { assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { requireVerifiedUser, safeUserSelect } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";
import { updateProfileSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = withApi(async (req) => {
  assertCsrf(req);
  const user = await requireVerifiedUser(req);
  rateLimitOrThrow(`profile:${user.id}`, 20, 60 * 60 * 1000);

  const input = await parseJson(req, updateProfileSchema);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: input,
    select: safeUserSelect,
  });

  await logSecurityEvent({ action: "PROFILE_UPDATED", userId: user.id, req });
  return json({ ok: true, user: updated });
});
