import { assertCsrf, json, withApi } from "@/lib/api";
import { rotateRefreshToken } from "@/lib/auth/session";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  assertCsrf(req);
  rateLimitOrThrow(`refresh:ip:${getClientIp(req)}`, 60, 15 * 60 * 1000);

  const user = await rotateRefreshToken(req);
  return json({ ok: true, user });
});
