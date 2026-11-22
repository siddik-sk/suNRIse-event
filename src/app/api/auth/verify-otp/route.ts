import { ApiError, assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { issueSession, safeUserSelect } from "@/lib/auth/session";
import { EMAIL_OTP_MAX_ATTEMPTS, hashEmailOtp, safeEqual } from "@/lib/auth/tokens";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";
import { verifyOtpSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/verify-otp
 * Verifies the 6-digit code emailed at signup or login, marks the email as
 * verified and issues a session so the student lands straight in the dashboard.
 */
export const POST = withApi(async (req) => {
  assertCsrf(req);

  const ip = getClientIp(req);
  rateLimitOrThrow(`otp:ip:${ip}`, 40, 60 * 60 * 1000);

  const { email, otp } = await parseJson(req, verifyOtpSchema);
  rateLimitOrThrow(`otp:email:${email}`, 12, 15 * 60 * 1000);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await logSecurityEvent({ action: "EMAIL_VERIFY_FAILED", detail: "Unknown email for OTP.", req });
    throw new ApiError(400, "That code is incorrect or has expired. Request a new one.", "INVALID_OTP");
  }

  if (user.emailVerified) {
    throw new ApiError(400, "This email is already verified. Please log in.", "ALREADY_VERIFIED");
  }

  if (!user.emailOtpHash || !user.emailOtpExpiresAt) {
    throw new ApiError(400, "That code is incorrect or has expired. Request a new one.", "OTP_EXPIRED");
  }

  if (user.emailOtpExpiresAt.getTime() <= Date.now()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailOtpHash: null, emailOtpExpiresAt: null, emailOtpAttempts: 0 },
    });
    throw new ApiError(400, "That code has expired. Tap “Resend code” to get a new one.", "OTP_EXPIRED");
  }

  if (user.emailOtpAttempts >= EMAIL_OTP_MAX_ATTEMPTS) {
    throw new ApiError(
      429,
      "Too many incorrect codes. Request a new code and try again.",
      "OTP_ATTEMPTS_EXCEEDED",
    );
  }

  const matches = safeEqual(hashEmailOtp(email, otp), user.emailOtpHash);

  if (!matches) {
    const attempt = await prisma.user.update({
      where: { id: user.id },
      data: { emailOtpAttempts: { increment: 1 } },
      select: { emailOtpAttempts: true },
    });
    await logSecurityEvent({
      action: "EMAIL_VERIFY_FAILED",
      detail: `Incorrect OTP attempt ${attempt.emailOtpAttempts}.`,
      userId: user.id,
      req,
    });

    const remaining = Math.max(0, EMAIL_OTP_MAX_ATTEMPTS - attempt.emailOtpAttempts);
    if (remaining === 0) {
      throw new ApiError(
        429,
        "Too many incorrect codes. Request a new code and try again.",
        "OTP_ATTEMPTS_EXCEEDED",
      );
    }

    throw new ApiError(
      400,
      `That code is incorrect. ${remaining} ${remaining === 1 ? "attempt" : "attempts"} left.`,
      "INVALID_OTP",
      { attemptsRemaining: remaining },
    );
  }

  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailOtpHash: null,
      emailOtpExpiresAt: null,
      emailOtpAttempts: 0,
      emailOtpSentAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
    select: safeUserSelect,
  });

  // Any outstanding verification links are now redundant.
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  await issueSession(verifiedUser, req);
  await logSecurityEvent({ action: "EMAIL_VERIFIED", detail: "Verified with 6-digit OTP.", userId: user.id, req });
  await logSecurityEvent({ action: "LOGIN_SUCCESS", detail: "Session issued after OTP verification.", userId: user.id, req });

  return json({ ok: true, user: verifiedUser });
});
