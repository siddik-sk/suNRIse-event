import { describe, expect, it } from "vitest";
import { buildRegistrationWhere } from "@/lib/admin-filters";

describe("buildRegistrationWhere", () => {
  it("returns an empty filter for no params", () => {
    expect(buildRegistrationWhere({})).toEqual({});
  });

  it("searches pass IDs, names, emails and roll numbers", () => {
    const where = buildRegistrationWhere({ q: "sai" });
    expect(where.OR).toHaveLength(2);
    expect(where.OR?.[0]).toEqual({ registrationId: { contains: "sai", mode: "insensitive" } });
    expect(where.OR?.[1]).toMatchObject({
      user: {
        OR: [
          { name: { contains: "sai", mode: "insensitive" } },
          { email: { contains: "sai", mode: "insensitive" } },
          { rollNumber: { contains: "sai", mode: "insensitive" } },
        ],
      },
    });
  });

  it("combines college and department into a user filter", () => {
    const where = buildRegistrationWhere({ college: "NRI", department: "CSE" });
    expect(where.user).toEqual({
      is: {
        college: { contains: "NRI", mode: "insensitive" },
        department: { contains: "CSE", mode: "insensitive" },
      },
    });
  });

  it("filters by event participation", () => {
    expect(buildRegistrationWhere({ eventId: "evt_123" })).toEqual({
      eventRegistrations: { some: { eventId: "evt_123" } },
    });
  });

  it("filters by gate check-in state", () => {
    expect(buildRegistrationWhere({ attended: "true" })).toEqual({ checkedInAt: { not: null } });
    expect(buildRegistrationWhere({ attended: "false" })).toEqual({ checkedInAt: null });
    expect(buildRegistrationWhere({ attended: "maybe" })).toEqual({});
  });

  it("composes search, user and check-in filters", () => {
    const where = buildRegistrationWhere({ q: "SUN27", college: "NRI", attended: "true" });
    expect(where.OR).toBeDefined();
    expect(where.user).toBeDefined();
    expect(where.checkedInAt).toEqual({ not: null });
  });
});
