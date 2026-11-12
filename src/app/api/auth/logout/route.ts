import { assertCsrf, json, withApi } from "@/lib/api";
import { revokeCurrentSession } from "@/lib/auth/session";
import { logSecurityEvent } from "@/lib/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  assertCsrf(req);
  await revokeCurrentSession(req);
  await logSecurityEvent({ action: "LOGOUT", req });
  return json({ ok: true });
});
