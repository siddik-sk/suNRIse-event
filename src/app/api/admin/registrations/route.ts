import { json, withApi } from "@/lib/api";
import { buildRegistrationWhere } from "@/lib/admin-filters";
import { requireAdmin } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { adminRegistrationQuerySchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/registrations — paginated, searchable registration table. */
export const GET = withApi(async (req) => {
  await requireAdmin(req);

  const url = new URL(req.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  const query = adminRegistrationQuerySchema.parse(raw);
  const where = buildRegistrationWhere(raw);

  const [total, rows] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            college: true,
            department: true,
            year: true,
            rollNumber: true,
            uploads: { select: { id: true, originalName: true, mimeType: true, size: true } },
          },
        },
        eventRegistrations: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                day: true,
                startTime: true,
                venue: true,
                department: { select: { shortName: true } },
              },
            },
          },
          orderBy: { event: { startTime: "asc" } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
  ]);

  return json({
    ok: true,
    registrations: rows,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      pages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  });
});
