import { assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { issueEmailVerification } from "@/lib/auth/verification";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";
import { resendVerificationSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  assertCsrf(req);
  const ip = getClientIp(req);
  rateLimitOrThrow(`resend:ip:${ip}`, 10, 60 * 60 * 1000);

  const { email } = await parseJson(req, resendVerificationSchema);
  rateLimitOrThrow(`resend:email:${email}`, 3, 15 * 60 * 1000);

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return the same response to prevent account enumeration.
  if (user && !user.emailVerified) {
    const verification = await issueEmailVerification({ user, req });
    await logSecurityEvent({ action: "VERIFICATION_RESENT", userId: user.id, req });

    return json({
      ok: true,
      message: "If that account needs verification, a fresh code and link are on the way.",
      ...(verification.devOtp ? { devOtp: verification.devOtp } : {}),
    });
  }

  return json({
    ok: true,
    message: "If that account needs verification, a fresh code and link are on the way.",
  });
});
