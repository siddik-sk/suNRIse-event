import { json, withApi } from "@/lib/api";
import { getEvents, parseEventFilters } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const url = new URL(req.url);
  const filters = parseEventFilters(url.searchParams);
  const events = await getEvents(filters);
  return json({ ok: true, count: events.length, events });
});
