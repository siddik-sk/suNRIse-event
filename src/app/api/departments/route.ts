import { json, withApi } from "@/lib/api";
import { getDepartments } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async () => {
  const departments = await getDepartments();
  return json({ ok: true, departments });
});
