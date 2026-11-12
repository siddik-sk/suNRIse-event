import { Prisma } from "@prisma/client";
import { ApiError, assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { slugify } from "@/lib/utils";
import { adminEventSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function uniqueSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "event";
  let candidate = base;
  let suffix = 1;
  // Bounded loop: collisions are rare.
  while (suffix < 100) {
    const existing = await prisma.event.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return `${base}-${Date.now()}`;
}

/** GET /api/admin/events — includes inactive events. */
export const GET = withApi(async (req) => {
  await requireAdmin(req);
  const events = await prisma.event.findMany({
    include: {
      department: { select: { id: true, name: true, shortName: true, slug: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });
  return json({ ok: true, events });
});

/** POST /api/admin/events */
export const POST = withApi(async (req) => {
  assertCsrf(req);
  const admin = await requireAdmin(req);
  const input = await parseJson(req, adminEventSchema);

  const department = await prisma.department.findUnique({ where: { id: input.departmentId } });
  if (!department) throw new ApiError(400, "Choose a valid department.", "INVALID_DEPARTMENT");

  const event = await prisma.event.create({
    data: {
      slug: await uniqueSlug(input.title),
      title: input.title,
      description: input.description,
      category: input.category,
      departmentId: input.departmentId,
      day: input.day,
      startTime: input.startTime,
      endTime: input.endTime,
      venue: input.venue,
      prize: input.prize,
      rules: input.rules,
      coordinators: input.coordinators as Prisma.InputJsonValue,
      capacity: input.capacity,
      teamSize: input.teamSize,
      fee: input.fee,
      isFeatured: input.isFeatured,
      isActive: input.isActive,
    },
    include: { department: true, _count: { select: { registrations: true } } },
  });

  await logSecurityEvent({
    action: "ADMIN_EVENT_CREATED",
    detail: `Event ${event.slug}.`,
    userId: admin.id,
    req,
  });
  return json({ ok: true, event }, { status: 201 });
});
