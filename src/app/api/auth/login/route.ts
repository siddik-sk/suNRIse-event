import { ApiError, assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { fakePasswordCheck, verifyPassword } from "@/lib/auth/password";
import { issueSession, safeUserSelect } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { verifyCaptcha } from "@/lib/security/captcha";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit";
import { loginSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export const POST = withApi(async (req) => {
  assertCsrf(req);

  const ip = getClientIp(req);
  rateLimitOrThrow(`login:ip:${ip}`, 20, 15 * 60 * 1000);

  const input = await parseJson(req, loginSchema);
  rateLimitOrThrow(`login:email:${input.email}`, 10, 15 * 60 * 1000);

  await verifyCaptcha(input.turnstileToken, req);

  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    await fakePasswordCheck(input.password);
    await logSecurityEvent({ action: "LOGIN_FAILED", detail: "Unknown email.", req });
    throw new ApiError(401, "Email or password is incorrect.", "INVALID_CREDENTIALS");
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    await logSecurityEvent({ action: "LOGIN_LOCKED", userId: user.id, req });
    throw new ApiError(429, "Too many failed attempts. Please try again in 15 minutes.", "ACCOUNT_LOCKED");
  }

  const valid = await verifyPassword(input.password, user.passwordHash);

  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const lock = attempts >= MAX_FAILED_ATTEMPTS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: lock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null,
      },
    });
    await logSecurityEvent({
      action: lock ? "ACCOUNT_LOCKED" : "LOGIN_FAILED",
      detail: lock ? "Lockout threshold reached." : `Failed attempt ${attempts}.`,
      userId: user.id,
      req,
    });
    if (lock) {
      throw new ApiError(429, "Too many failed attempts. Please try again in 15 minutes.", "ACCOUNT_LOCKED");
    }
    throw new ApiError(401, "Email or password is incorrect.", "INVALID_CREDENTIALS");
  }

  if (!user.emailVerified) {
    throw new ApiError(
      403,
      "Verify your email before logging in. Check your inbox or resend the verification link.",
      "EMAIL_UNVERIFIED",
    );
  }

  const safeUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
    select: safeUserSelect,
  });

  await issueSession(safeUser, req);
  await logSecurityEvent({ action: "LOGIN_SUCCESS", userId: user.id, req });

  return json({ ok: true, user: safeUser });
});
