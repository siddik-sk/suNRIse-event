import { ApiError } from "@/lib/api";

type Bucket = { count: number; resetAt: number };

/**
 * In-memory sliding-window rate limiter.
 *
 * Suitable for a single Node process and local development. For multi-region /
 * serverless production, swap this adapter for Upstash Redis (see SECURITY.md).
 * The function signatures are intentionally adapter-friendly.
 */
const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  const bucket =
    existing && existing.resetAt > now ? existing : { count: 0, resetAt: now + windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt,
    retryAfter,
  };
}

/** Throw a generic 429 without leaking limit internals. */
export function rateLimitOrThrow(key: string, limit: number, windowMs: number) {
  const result = checkRateLimit(key, limit, windowMs);
  if (!result.allowed) {
    throw new ApiError(
      429,
      `Too many attempts. Please try again in ${result.retryAfter} seconds.`,
      "RATE_LIMITED",
    );
  }
  return result;
}

/** Best-effort client IP extraction behind Vercel / common proxies. */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const candidates = [
    headers.get("x-vercel-forwarded-for"),
    headers.get("cf-connecting-ip"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
  ];
  for (const candidate of candidates) {
    const ip = candidate?.trim();
    if (ip && ip.length <= 64) return ip;
  }
  return "unknown";
}

/** Test helper only. */
export function resetRateLimits() {
  buckets.clear();
}
