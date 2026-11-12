import { assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { adminDepartmentSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  await requireAdmin(req);
  const departments = await prisma.department.findMany({
    include: { _count: { select: { events: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return json({ ok: true, departments });
});

export const POST = withApi(async (req) => {
  assertCsrf(req);
  const admin = await requireAdmin(req);
  const input = await parseJson(req, adminDepartmentSchema);

  const department = await prisma.department.create({
    data: {
      slug: input.slug,
      name: input.name,
      shortName: input.shortName,
      description: input.description,
      tagline: input.tagline || null,
      accent: input.accent,
      icon: input.icon,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
    },
    include: { _count: { select: { events: true } } },
  });

  await logSecurityEvent({
    action: "ADMIN_DEPARTMENT_CREATED",
    detail: `Department ${department.slug}.`,
    userId: admin.id,
    req,
  });
  return json({ ok: true, department }, { status: 201 });
});
