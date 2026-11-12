import { json } from "@/lib/api";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ status: "ok", service: "sunriseevent", time: new Date().toISOString() });
  } catch {
    return json({ status: "degraded", service: "sunriseevent" }, { status: 503 });
  }
}
