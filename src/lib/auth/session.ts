import { cookies } from "next/headers";
import type { Prisma, Role } from "@prisma/client";
import { ApiError } from "@/lib/api";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import {
  ACCESS_COOKIE,
  CSRF_COOKIE,
  REFRESH_COOKIE,
  accessTokenTtlSeconds,
  hashToken,
  randomToken,
  refreshTokenTtlMs,
  signAccessToken,
  verifyAccessToken,
} from "@/lib/auth/tokens";
import { getClientIp } from "@/lib/security/rate-limit";

export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  college: true,
  department: true,
  year: true,
  rollNumber: true,
  role: true,
  emailVerified: true,
  createdAt: true,
  lastLoginAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;

const isProd = process.env.NODE_ENV === "production";

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
}

function readCookieFromRequest(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

async function readCookie(name: string): Promise<string | null> {
  const jar = await cookies();
  return jar.get(name)?.value ?? null;
}

/** Set auth cookies and create a refresh-token session row. */
export async function issueSession(user: SafeUser, req?: Request): Promise<void> {
  const jar = await cookies();
  const refreshRaw = randomToken();
  const expiry = new Date(Date.now() + refreshTokenTtlMs());

  await prisma.session.create({
    data: {
      tokenHash: hashToken(refreshRaw),
      userId: user.id,
      expiresAt: expiry,
      ip: req ? getClientIp(req) : null,
      userAgent: req?.headers.get("user-agent")?.slice(0, 250) ?? null,
    },
  });

  const access = await signAccessToken({
    sub: user.id,
    role: user.role,
    verified: user.emailVerified,
    email: user.email,
  });

  jar.set(ACCESS_COOKIE, access, { ...baseCookieOptions(), maxAge: accessTokenTtlSeconds() });
  jar.set(REFRESH_COOKIE, refreshRaw, { ...baseCookieOptions(), maxAge: Math.floor(refreshTokenTtlMs() / 1000) });

  // Ensure the client has a CSRF double-submit token.
  if (!jar.get(CSRF_COOKIE)?.value) {
    jar.set(CSRF_COOKIE, randomToken(24), {
      httpOnly: false,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
}

/** Rotate refresh token; detects token reuse and revokes the session family. */
export async function rotateRefreshToken(req?: Request): Promise<SafeUser> {
  const raw = req ? readCookieFromRequest(req, REFRESH_COOKIE) : await readCookie(REFRESH_COOKIE);
  if (!raw) throw new ApiError(401, "Your session has expired. Please log in again.", "NO_REFRESH");

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: { user: { select: safeUserSelect } },
  });

  if (!session) {
    await clearAuthCookies();
    throw new ApiError(401, "Your session has expired. Please log in again.", "INVALID_REFRESH");
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } }).catch(() => {});
    await clearAuthCookies();
    throw new ApiError(401, "Your session has expired. Please log in again.", "EXPIRED_REFRESH");
  }

  if (session.revokedAt) {
    // A rotated token was presented again: assume theft and revoke every session.
    await prisma.session.updateMany({
      where: { userId: session.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await logSecurityEvent({
      action: "REFRESH_TOKEN_REUSE",
      detail: "Rotated refresh token reuse detected; all sessions revoked.",
      userId: session.userId,
      req,
    });
    await clearAuthCookies();
    throw new ApiError(401, "Your session was ended for security reasons. Please log in again.", "REFRESH_REUSE");
  }

  const newRaw = randomToken();
  const newExpiry = new Date(Date.now() + refreshTokenTtlMs());
  const newSession = await prisma.session.create({
    data: {
      tokenHash: hashToken(newRaw),
      userId: session.userId,
      expiresAt: newExpiry,
      ip: req ? getClientIp(req) : null,
      userAgent: req?.headers.get("user-agent")?.slice(0, 250) ?? null,
    },
  });

  await prisma.session.update({
    where: { id: session.id },
    data: { revokedAt: new Date(), replacedById: newSession.id },
  });

  const access = await signAccessToken({
    sub: session.user.id,
    role: session.user.role,
    verified: session.user.emailVerified,
    email: session.user.email,
  });

  const jar = await cookies();
  jar.set(ACCESS_COOKIE, access, { ...baseCookieOptions(), maxAge: accessTokenTtlSeconds() });
  jar.set(REFRESH_COOKIE, newRaw, { ...baseCookieOptions(), maxAge: Math.floor(refreshTokenTtlMs() / 1000) });
  return session.user;
}

export async function getAuthenticatedUser(req?: Request): Promise<SafeUser | null> {
  const token = req ? readCookieFromRequest(req, ACCESS_COOKIE) : await readCookie(ACCESS_COOKIE);
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload?.sub) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: safeUserSelect });
  return user;
}

export async function requireUser(req?: Request): Promise<SafeUser> {
  const user = await getAuthenticatedUser(req);
  if (!user) throw new ApiError(401, "Please log in to continue.", "UNAUTHENTICATED");
  return user;
}

export async function requireVerifiedUser(req?: Request): Promise<SafeUser> {
  const user = await requireUser(req);
  if (!user.emailVerified) {
    throw new ApiError(403, "Please verify your email address first.", "EMAIL_UNVERIFIED");
  }
  return user;
}

export async function requireAdmin(req?: Request): Promise<SafeUser> {
  const user = await requireUser(req);
  if (user.role !== ("ADMIN" satisfies Role)) {
    throw new ApiError(403, "You do not have permission to do that.", "FORBIDDEN");
  }
  return user;
}

export async function revokeCurrentSession(req?: Request): Promise<void> {
  const raw = req ? readCookieFromRequest(req, REFRESH_COOKIE) : await readCookie(REFRESH_COOKIE);
  if (raw) {
    await prisma.session
      .updateMany({ where: { tokenHash: hashToken(raw), revokedAt: null }, data: { revokedAt: new Date() } })
      .catch(() => {});
  }
  await clearAuthCookies();
}

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, "", { ...baseCookieOptions(), maxAge: 0 });
  jar.set(REFRESH_COOKIE, "", { ...baseCookieOptions(), maxAge: 0 });
}

/** Housekeeping: drop expired sessions. Safe to call opportunistically. */
export async function pruneExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
}
