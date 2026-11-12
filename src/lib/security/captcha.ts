import { ApiError } from "@/lib/api";
import { getClientIp } from "@/lib/security/rate-limit";

/**
 * Cloudflare Turnstile verification.
 * - Production: both keys are mandatory; a missing secret is a hard failure.
 * - Development/test: if keys are absent, captcha is bypassed with a warning so
 *   the project runs out of the box. Configure keys before deploying.
 */
export async function verifyCaptcha(token: string | undefined, req: Request): Promise<void> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProd) {
      console.error("[captcha] TURNSTILE_SECRET_KEY is not configured in production");
      throw new ApiError(503, "Registration is temporarily unavailable.", "CAPTCHA_NOT_CONFIGURED");
    }
    return;
  }

  if (!token) throw new ApiError(400, "Please complete the human verification challenge.", "CAPTCHA_REQUIRED");

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
      remoteip: getClientIp(req),
    });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean };
    if (!data.success) {
      throw new ApiError(400, "Human verification failed. Please try again.", "CAPTCHA_FAILED");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error("[captcha] verification request failed");
    throw new ApiError(502, "Could not verify the challenge. Please retry.", "CAPTCHA_UNAVAILABLE");
  }
}
