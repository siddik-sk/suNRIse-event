import { afterEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  getClientIp,
  rateLimitOrThrow,
  resetRateLimits,
} from "@/lib/security/rate-limit";
import { ApiError } from "@/lib/api";

afterEach(() => {
  resetRateLimits();
});

describe("checkRateLimit", () => {
  it("allows requests up to the limit and then blocks", () => {
    for (let index = 0; index < 3; index += 1) {
      const result = checkRateLimit("test:key", 3, 60_000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2 - index);
    }

    const blocked = checkRateLimit("test:key", 3, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("isolates keys from each other", () => {
    checkRateLimit("key-a", 1, 60_000);
    expect(checkRateLimit("key-a", 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit("key-b", 1, 60_000).allowed).toBe(true);
  });

  it("resets after the window elapses", async () => {
    expect(checkRateLimit("short-window", 1, 20).allowed).toBe(true);
    expect(checkRateLimit("short-window", 1, 20).allowed).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(checkRateLimit("short-window", 1, 20).allowed).toBe(true);
  });
});

describe("rateLimitOrThrow", () => {
  it("throws a 429 ApiError once exhausted", () => {
    rateLimitOrThrow("throw:key", 1, 60_000);
    try {
      rateLimitOrThrow("throw:key", 1, 60_000);
      expect.unreachable("Expected rateLimitOrThrow to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(429);
      expect((error as ApiError).code).toBe("RATE_LIMITED");
    }
  });
});

describe("getClientIp", () => {
  it("prefers trusted proxy headers in order", () => {
    const request = new Request("http://localhost/api", {
      headers: {
        "x-vercel-forwarded-for": "203.0.113.5",
        "cf-connecting-ip": "198.51.100.4",
        "x-real-ip": "192.0.2.3",
        "x-forwarded-for": "10.0.0.1, 10.0.0.2",
      },
    });
    expect(getClientIp(request)).toBe("203.0.113.5");
  });

  it("falls back to the first x-forwarded-for entry", () => {
    const request = new Request("http://localhost/api", {
      headers: { "x-forwarded-for": "  10.0.0.1 , 10.0.0.2" },
    });
    expect(getClientIp(request)).toBe("10.0.0.1");
  });

  it("returns unknown without headers", () => {
    expect(getClientIp(new Request("http://localhost/api"))).toBe("unknown");
  });
});
