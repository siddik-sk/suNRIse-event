import { ApiError, assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { hashToken } from "@/lib/auth/tokens";
import { logSecurityEvent } from "@/lib/security/audit";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";
import { verifyEmailSchema } from "@/lib/validation/schemas";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  assertCsrf(req);
  rateLimitOrThrow(`verify:ip:${getClientIp(req)}`, 20, 60 * 60 * 1000);

  const { token } = await parseJson(req, verifyEmailSchema);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "This verification link is invalid or has expired.", "INVALID_TOKEN");
  }

  const claimed = await prisma.emailVerificationToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count === 0) {
    throw new ApiError(400, "This verification link has already been used.", "TOKEN_USED");
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true, failedLoginAttempts: 0, lockedUntil: null },
  });
  await prisma.emailVerificationToken.updateMany({
    where: { userId: record.userId, usedAt: null },
    data: { usedAt: new Date() },
  });

  await logSecurityEvent({ action: "EMAIL_VERIFIED", userId: record.userId, req });

  return json({ ok: true, email: record.user.email, message: "Email verified. You can log in now." });
});
