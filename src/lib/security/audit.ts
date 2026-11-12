import prisma from "@/lib/prisma";
import { getClientIp } from "@/lib/security/rate-limit";

type SecurityEvent = {
  action: string;
  detail?: string;
  userId?: string | null;
  req?: Request;
};

/**
 * Never log passwords, tokens, full request bodies, or college ID contents.
 * Failures are swallowed so auditing can never break a user request.
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const ip = event.req ? getClientIp(event.req) : null;
  const userAgent = event.req?.headers.get("user-agent")?.slice(0, 250) ?? null;

  console.warn(
    JSON.stringify({
      level: "security",
      action: event.action,
      detail: event.detail ?? null,
      userId: event.userId ?? null,
      ip,
      at: new Date().toISOString(),
    }),
  );

  try {
    await prisma.auditLog.create({
      data: {
        action: event.action,
        detail: event.detail ?? null,
        userId: event.userId ?? null,
        ip,
        userAgent,
      },
    });
  } catch {
    /* auditing must be best-effort */
  }
}
