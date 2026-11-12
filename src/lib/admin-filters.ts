import type { Prisma } from "@prisma/client";

/** Shared filter builder for the admin table and CSV export. */
export function buildRegistrationWhere(params: Record<string, string>): Prisma.RegistrationWhereInput {
  const where: Prisma.RegistrationWhereInput = {};

  if (params.q) {
    where.OR = [
      { registrationId: { contains: params.q, mode: "insensitive" } },
      {
        user: {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { email: { contains: params.q, mode: "insensitive" } },
            { rollNumber: { contains: params.q, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const userFilter: Prisma.UserWhereInput = {};
  if (params.college) userFilter.college = { contains: params.college, mode: "insensitive" };
  if (params.department) userFilter.department = { contains: params.department, mode: "insensitive" };
  if (Object.keys(userFilter).length) {
    where.user = { is: userFilter };
  }

  if (params.eventId) where.eventRegistrations = { some: { eventId: params.eventId } };
  if (params.attended === "true") where.checkedInAt = { not: null };
  if (params.attended === "false") where.checkedInAt = null;
  return where;
}
