import { describe, expect, it } from "vitest";
import {
  addEventsSchema,
  adminDepartmentSchema,
  adminEventSchema,
  adminRegistrationQuerySchema,
  contactSchema,
  loginSchema,
  password,
  phone,
  registerSchema,
  updateProfileSchema,
} from "@/lib/validation/schemas";

const eventId = "clx0event0000000000000001";

describe("phone", () => {
  it("normalises Indian numbers with country code and separators", () => {
    expect(phone.parse("+91 98765 43210")).toBe("9876543210");
    expect(phone.parse("919876543210")).toBe("9876543210");
    expect(phone.parse("9876543210")).toBe("9876543210");
  });

  it("rejects invalid numbers", () => {
    expect(phone.safeParse("12345").success).toBe(false);
    expect(phone.safeParse("1234567890").success).toBe(false);
    expect(phone.safeParse("+91 58765 43210").success).toBe(false);
  });
});

describe("password", () => {
  it("requires length, cases, a digit and a symbol", () => {
    expect(password.safeParse("Str0ng!pass").success).toBe(true);
    for (const value of ["short1!", "ALLUPPER1!", "alllower1!", "NoDigits!!", "NoSymbols12"]) {
      expect(password.safeParse(value).success).toBe(false);
    }
  });
});

describe("registerSchema", () => {
  const base = {
    name: "  Sai   Kumar  ",
    email: "  SAI@Example.COM ",
    phone: "+91 98765 43210",
    password: "Str0ng!pass",
    confirmPassword: "Str0ng!pass",
    college: "NRI University",
    department: "Computer Science & Engineering",
    year: "2nd Year",
    rollNumber: " 22nri1cs087 ",
    eventIds: [eventId],
    acceptTerms: true,
  };

  it("cleans and normalises input", () => {
    const parsed = registerSchema.parse(base);
    expect(parsed.name).toBe("Sai Kumar");
    expect(parsed.email).toBe("sai@example.com");
    expect(parsed.phone).toBe("9876543210");
    expect(parsed.rollNumber).toBe("22NRI1CS087");
    expect(parsed.eventIds).toEqual([eventId]);
  });

  it("rejects mismatched passwords and duplicate events", () => {
    expect(registerSchema.safeParse({ ...base, confirmPassword: "Other0!pass" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, eventIds: [eventId, eventId] }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, eventIds: [] }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, acceptTerms: false }).success).toBe(false);
  });

  it("rejects invalid names and emails", () => {
    expect(registerSchema.safeParse({ ...base, name: "Sai #1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
  });
});

describe("login and profile schemas", () => {
  it("requires a password on login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("uppercases roll numbers on profile updates", () => {
    const parsed = updateProfileSchema.parse({
      name: "Sai Kumar",
      phone: "9876543210",
      college: "NRI University",
      department: "CSE",
      year: "3rd Year",
      rollNumber: "22nri1cs087",
    });
    expect(parsed.rollNumber).toBe("22NRI1CS087");
  });
});

describe("event selection", () => {
  it("caps selections at six and deduplicates", () => {
    const ids = Array.from({ length: 7 }, (_, index) => `${eventId}${index}`);
    expect(addEventsSchema.safeParse({ eventIds: ids.slice(0, 6) }).success).toBe(true);
    expect(addEventsSchema.safeParse({ eventIds: ids }).success).toBe(false);
    expect(addEventsSchema.safeParse({ eventIds: [eventId, eventId] }).success).toBe(false);
  });
});

describe("admin schemas", () => {
  const event = {
    title: "Hack the Grid",
    description: "A 24-hour flagship hackathon for builders across every campus.",
    category: "TECHNICAL",
    departmentId: "clx0dept0000000000000001",
    day: 1,
    startTime: "09:00",
    endTime: "17:00",
    venue: "CSE Block",
    prize: "₹25,000",
    rules: ["Teams of four", "Bring your own laptop"],
    coordinators: [{ name: "Sai Kumar", phone: "+91 98765 43210" }],
    capacity: 120,
    teamSize: "1-4",
    fee: 0,
    isFeatured: true,
    isActive: true,
  };

  it("accepts a valid event payload and coerces numbers", () => {
    const parsed = adminEventSchema.parse({ ...event, capacity: "120", fee: "50", day: "2" });
    expect(parsed.capacity).toBe(120);
    expect(parsed.fee).toBe(50);
    expect(parsed.day).toBe(2);
    expect(parsed.coordinators[0].phone).toBe("9876543210");
  });

  it("rejects invalid times and categories", () => {
    expect(adminEventSchema.safeParse({ ...event, startTime: "9am" }).success).toBe(false);
    expect(adminEventSchema.safeParse({ ...event, endTime: "24:00" }).success).toBe(false);
    expect(adminEventSchema.safeParse({ ...event, category: "SPORTS" }).success).toBe(false);
  });

  it("normalises department slugs", () => {
    const parsed = adminDepartmentSchema.parse({
      name: "Computer Science & Engineering",
      shortName: "cse",
      slug: " CSE ",
      description: "Algorithms, systems and open source.",
      accent: "cyan",
      icon: "terminal",
      sortOrder: "2",
    });
    expect(parsed.shortName).toBe("CSE");
    expect(parsed.slug).toBe("cse");
    expect(parsed.sortOrder).toBe(2);
    expect(adminDepartmentSchema.safeParse({ ...parsed, slug: "Not A Slug" }).success).toBe(false);
  });

  it("defaults admin registration pagination", () => {
    const parsed = adminRegistrationQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
    expect(adminRegistrationQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(adminRegistrationQuerySchema.safeParse({ pageSize: "101" }).success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("requires a meaningful message", () => {
    const base = { name: "Sai Kumar", email: "sai@example.com", subject: "Help", message: "Short" };
    expect(contactSchema.safeParse(base).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, message: "This is a long enough message to pass." }).success).toBe(true);
  });
});
