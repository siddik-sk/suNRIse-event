import { ApiError, assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/tokens";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";
import { resetPasswordSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  assertCsrf(req);
  rateLimitOrThrow(`reset:ip:${getClientIp(req)}`, 10, 60 * 60 * 1000);

  const input = await parseJson(req, resetPasswordSchema);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "This reset link is invalid or has expired. Request a new one.", "INVALID_TOKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const now = new Date();

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: now },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: now },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    }),
    // Force re-login everywhere after a password reset.
    prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);

  await logSecurityEvent({ action: "PASSWORD_RESET_COMPLETED", userId: record.userId, req });

  return json({ ok: true, message: "Password updated. Log in with your new password." });
});
