import { Prisma } from "@prisma/client";
import { ApiError, assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { adminEventSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
const updateSchema = adminEventSchema.partial();

export const PATCH = withApi<Context>(async (req, ctx) => {
  assertCsrf(req);
  const admin = await requireAdmin(req);
  const { id } = await ctx.params;

  const input = await parseJson(req, updateSchema);
  if (input.departmentId) {
    const department = await prisma.department.findUnique({ where: { id: input.departmentId } });
    if (!department) throw new ApiError(400, "Choose a valid department.", "INVALID_DEPARTMENT");
  }

  const data: Prisma.EventUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.category !== undefined) data.category = input.category;
  if (input.departmentId !== undefined) data.department = { connect: { id: input.departmentId } };
  if (input.day !== undefined) data.day = input.day;
  if (input.startTime !== undefined) data.startTime = input.startTime;
  if (input.endTime !== undefined) data.endTime = input.endTime;
  if (input.venue !== undefined) data.venue = input.venue;
  if (input.prize !== undefined) data.prize = input.prize;
  if (input.rules !== undefined) data.rules = input.rules;
  if (input.coordinators !== undefined) data.coordinators = input.coordinators as Prisma.InputJsonValue;
  if (input.capacity !== undefined) data.capacity = input.capacity;
  if (input.teamSize !== undefined) data.teamSize = input.teamSize;
  if (input.fee !== undefined) data.fee = input.fee;
  if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  const event = await prisma.event.update({
    where: { id },
    data,
    include: { department: true, _count: { select: { registrations: true } } },
  });

  await logSecurityEvent({ action: "ADMIN_EVENT_UPDATED", detail: `Event ${event.slug}.`, userId: admin.id, req });
  return json({ ok: true, event });
});

export const DELETE = withApi<Context>(async (req, ctx) => {
  assertCsrf(req);
  const admin = await requireAdmin(req);
  const { id } = await ctx.params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: { slug: true, _count: { select: { registrations: true } } },
  });
  if (!event) throw new ApiError(404, "Event not found.", "NOT_FOUND");

  await prisma.event.delete({ where: { id } });
  await logSecurityEvent({
    action: "ADMIN_EVENT_DELETED",
    detail: `Deleted ${event.slug} (${event._count.registrations} registrations cascaded).`,
    userId: admin.id,
    req,
  });
  return json({ ok: true });
});
