import { describe, expect, it } from "vitest";
import {
  accessTokenTtlSeconds,
  hashToken,
  newQrToken,
  newRegistrationId,
  parseQrPayload,
  qrPayload,
  safeEqual,
  signAccessToken,
  verifyAccessToken,
} from "@/lib/auth/tokens";

describe("registration identifiers", () => {
  it("creates SUN27 IDs with six unambiguous characters", () => {
    const ids = new Set<string>();
    for (let index = 0; index < 50; index += 1) {
      const id = newRegistrationId();
      expect(id).toMatch(/^SUN27-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
      ids.add(id);
    }
    expect(ids.size).toBe(50);
  });
});

describe("QR payloads", () => {
  it("round-trips a generated token", () => {
    const token = newQrToken();
    const payload = qrPayload(token);
    expect(payload.startsWith("SUNRISE27:")).toBe(true);
    expect(parseQrPayload(payload)).toBe(token);
  });

  it("accepts raw legacy tokens", () => {
    expect(parseQrPayload("demo-qr-token-sunriseevent-2027-abcdef")).toBe(
      "demo-qr-token-sunriseevent-2027-abcdef",
    );
  });

  it("rejects short, long and malformed payloads", () => {
    expect(parseQrPayload("SUNRISE27:short")).toBeNull();
    expect(parseQrPayload("SUNRISE27:")).toBeNull();
    expect(parseQrPayload("x".repeat(81))).toBeNull();
    expect(parseQrPayload("not a valid token with spaces")).toBeNull();
    expect(parseQrPayload("SUNRISE27:has spaces inside the token value")).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    const token = newQrToken();
    expect(parseQrPayload(`  ${qrPayload(token)}  `)).toBe(token);
  });
});

describe("token hashing", () => {
  it("is deterministic and keyed", () => {
    const token = "refresh-token-value";
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(hashToken(`${token}-other`));
  });

  it("compares strings safely", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});

describe("access tokens", () => {
  it("signs and verifies a payload", async () => {
    const token = await signAccessToken({
      sub: "user_123",
      role: "STUDENT",
      verified: true,
      email: "student@sunriseevent.in",
    });

    const payload = await verifyAccessToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.sub).toBe("user_123");
    expect(payload?.role).toBe("STUDENT");
    expect(payload?.verified).toBe(true);
    expect(payload?.email).toBe("student@sunriseevent.in");
    expect(payload?.iss).toBe("sunriseevent");
    expect(payload?.aud).toBe("sunriseevent-web");
  });

  it("rejects tampered or garbage tokens", async () => {
    const token = await signAccessToken({
      sub: "user_123",
      role: "ADMIN",
      verified: true,
      email: "admin@sunriseevent.in",
    });

    expect(await verifyAccessToken(`${token}x`)).toBeNull();
    expect(await verifyAccessToken("not-a-jwt")).toBeNull();
    expect(await verifyAccessToken("")).toBeNull();
  });

  it("exposes a positive TTL", () => {
    expect(accessTokenTtlSeconds()).toBeGreaterThan(0);
  });
});
