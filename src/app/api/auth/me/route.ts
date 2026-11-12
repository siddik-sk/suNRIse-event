import { json, withApi } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return json({ ok: false, user: null, error: "Not authenticated." }, { status: 401 });
  }
  return json({ ok: true, user });
});
