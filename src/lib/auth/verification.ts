import { EMAIL_OTP_TTL_MS, hashEmailOtp, hashToken, newEmailOtp, randomToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";

const LINK_TTL_MS = 24 * 60 * 60 * 1000;

type VerifiableUser = { id: string; email: string; name: string };

/** True when a real email provider (Resend or SMTP) is configured. */
export function mailProviderConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY ||
      process.env.SMTP_HOST ||
      (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD),
  );
}

/**
 * In local development without a mail provider (or when delivery failed) we
 * surface the OTP in the API response so the flow stays testable. Never
 * enabled in production.
 */
export function shouldExposeDevOtp(delivered = true): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return !mailProviderConfigured() || !delivered;
}

function isLoopbackHost(host: string) {
  return /^(localhost|127(\.\d+){3}|\[::1\]|(\d{1,3}\.){3}\d{1,3})(:\d+)?$/i.test(host);
}

/**
 * Build a clickable base URL. A configured public URL wins; otherwise the
 * request origin/host is used so links work from a phone on the same Wi-Fi
 * instead of always pointing at localhost.
 */
export function requestBaseUrl(req: Request): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "").replace(/\/$/, "");
  const configuredIsLoopback = !configured || /localhost|127\.0\.0\.1|\[::1\]/i.test(configured);
  if (!configuredIsLoopback) return configured;

  const origin = req.headers.get("origin");
  if (origin && /^https?:\/\//i.test(origin)) return origin.replace(/\/$/, "");

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host) {
    const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const proto = forwardedProto || (isLoopbackHost(host) ? "http" : "https");
    return `${proto}://${host}`;
  }

  return configured || "http://localhost:3000";
}

/**
 * Issue a fresh verification link + 6-digit OTP for a user and email both.
 * Any older unused link or code is invalidated first.
 */
export async function issueEmailVerification({ user, req }: { user: VerifiableUser; req?: Request }) {
  const now = new Date();
  const token = randomToken(32);
  const otp = newEmailOtp();
  const baseUrl = req ? requestBaseUrl(req) : undefined;

  await prisma.$transaction([
    prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: now },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(now.getTime() + LINK_TTL_MS),
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtpHash: hashEmailOtp(user.email, otp),
        emailOtpExpiresAt: new Date(now.getTime() + EMAIL_OTP_TTL_MS),
        emailOtpAttempts: 0,
        emailOtpSentAt: now,
      },
    }),
  ]);

  const delivered = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    token,
    otp,
    baseUrl,
    ttlMinutes: Math.round(EMAIL_OTP_TTL_MS / 60_000),
  });

  return {
    token,
    otp,
    delivered,
    devOtp: shouldExposeDevOtp(delivered) ? otp : undefined,
  };
}
