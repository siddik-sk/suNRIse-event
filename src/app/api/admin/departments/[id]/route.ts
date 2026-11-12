import type { Prisma } from "@prisma/client";
import { ApiError, assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { adminDepartmentSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
const updateSchema = adminDepartmentSchema.partial();

export const PATCH = withApi<Context>(async (req, ctx) => {
  assertCsrf(req);
  const admin = await requireAdmin(req);
  const { id } = await ctx.params;

  const input = await parseJson(req, updateSchema);
  const data: Prisma.DepartmentUpdateInput = {};
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.name !== undefined) data.name = input.name;
  if (input.shortName !== undefined) data.shortName = input.shortName;
  if (input.description !== undefined) data.description = input.description;
  if (input.tagline !== undefined) data.tagline = input.tagline || null;
  if (input.accent !== undefined) data.accent = input.accent;
  if (input.icon !== undefined) data.icon = input.icon;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  const department = await prisma.department.update({
    where: { id },
    data,
    include: { _count: { select: { events: true } } },
  });

  await logSecurityEvent({
    action: "ADMIN_DEPARTMENT_UPDATED",
    detail: `Department ${department.slug}.`,
    userId: admin.id,
    req,
  });
  return json({ ok: true, department });
});

export const DELETE = withApi<Context>(async (req, ctx) => {
  assertCsrf(req);
  const admin = await requireAdmin(req);
  const { id } = await ctx.params;

  const department = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { events: true } } },
  });
  if (!department) throw new ApiError(404, "Department not found.", "NOT_FOUND");
  if (department._count.events > 0) {
    throw new ApiError(
      409,
      "Move or delete this department's events first, or deactivate it instead.",
      "DEPARTMENT_HAS_EVENTS",
    );
  }

  await prisma.department.delete({ where: { id } });
  await logSecurityEvent({
    action: "ADMIN_DEPARTMENT_DELETED",
    detail: `Deleted department ${department.slug}.`,
    userId: admin.id,
    req,
  });
  return json({ ok: true });
});
