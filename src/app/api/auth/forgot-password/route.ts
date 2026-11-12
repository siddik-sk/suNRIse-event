import { assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { hashToken, randomToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { verifyCaptcha } from "@/lib/security/captcha";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";
import { forgotPasswordSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  assertCsrf(req);
  const ip = getClientIp(req);
  rateLimitOrThrow(`forgot:ip:${ip}`, 10, 60 * 60 * 1000);

  const input = await parseJson(req, forgotPasswordSchema);
  rateLimitOrThrow(`forgot:email:${input.email}`, 3, 30 * 60 * 1000);

  await verifyCaptcha(input.turnstileToken, req);

  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (user) {
    const raw = randomToken(32);
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendPasswordResetEmail(user.email, user.name, raw);
    await logSecurityEvent({ action: "PASSWORD_RESET_REQUESTED", userId: user.id, req });
  } else {
    await logSecurityEvent({ action: "PASSWORD_RESET_UNKNOWN_EMAIL", req });
  }

  if (process.env.NODE_ENV === "production" && !user) {
    // Keep timing roughly uniform for unknown accounts.
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return json({
    ok: true,
    message: "If an account exists for that email, a reset link is on its way.",
  });
});
