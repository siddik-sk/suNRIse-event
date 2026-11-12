import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { Role } from "@prisma/client";

const ACCESS_TTL_MINUTES = Number(process.env.ACCESS_TOKEN_TTL_MINUTES || 15);

export const ACCESS_COOKIE = "neo_access";
export const REFRESH_COOKIE = "neo_refresh";
export const CSRF_COOKIE = "neo_csrf";

export type AccessTokenPayload = JWTPayload & {
  sub: string;
  role: Role;
  verified: boolean;
  email: string;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be at least 32 characters");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-please-1234567890");
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: {
  sub: string;
  role: Role;
  verified: boolean;
  email: string;
}): Promise<string> {
  return new SignJWT({ role: payload.role, verified: payload.verified, email: payload.email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("sunriseevent")
    .setAudience("sunriseevent-web")
    .setExpirationTime(`${ACCESS_TTL_MINUTES}m`)
    .sign(secretKey());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: "sunriseevent",
      audience: "sunriseevent-web",
      algorithms: ["HS256"],
    });
    if (!payload.sub || typeof payload.role !== "string") return null;
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}

/** HMAC hash used for refresh tokens and email/reset tokens at rest. */
export function hashToken(raw: string): string {
  const pepper = process.env.REFRESH_TOKEN_PEPPER || process.env.AUTH_SECRET || "dev-pepper";
  return createHmac("sha256", pepper).update(raw).digest("base64url");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

const ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-readable registration ID, e.g. SUN27-K7M2QX. */
export function newRegistrationId(): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) out += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  return `SUN27-${out}`;
}

export function newQrToken(): string {
  return randomBytes(28).toString("base64url");
}

export function qrPayload(qrToken: string): string {
  return `SUNRISE27:${qrToken}`;
}

export function parseQrPayload(raw: string): string | null {
  const value = raw.trim();
  if (value.startsWith("SUNRISE27:")) {
    const token = value.slice("SUNRISE27:".length);
    return token.length >= 20 && token.length <= 80 && /^[\w-]+$/.test(token) ? token : null;
  }
  // Allow raw QR tokens for backwards compatibility with printed passes.
  return value.length >= 20 && value.length <= 80 && /^[\w-]+$/.test(value) ? value : null;
}

export function accessTokenTtlSeconds() {
  return ACCESS_TTL_MINUTES * 60;
}

export function refreshTokenTtlMs() {
  return Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7) * 24 * 60 * 60 * 1000;
}
