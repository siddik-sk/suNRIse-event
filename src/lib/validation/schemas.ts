import { z } from "zod";
import { CATEGORY_LABELS } from "@/lib/fest";

const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

/** Trim, collapse whitespace and strip control characters. */
function clean(value: string) {
  return value.replace(CONTROL_CHARS, "").replace(/[ \t]+/g, " ").trim();
}

const name = z
  .string({ required_error: "Your full name is required." })
  .transform(clean)
  .pipe(z.string().min(2, "Name must be at least 2 characters.").max(80, "Name is too long."))
  .refine((v) => /^[\p{L}\p{M}.'\- ]+$/u.test(v), "Name contains invalid characters.");

const email = z
  .string({ required_error: "Email is required." })
  .transform((v) => v.trim().toLowerCase())
  .pipe(z.string().email("Enter a valid email address.").max(254, "Email is too long."));

export const phone = z
  .string({ required_error: "Phone number is required." })
  .transform((v) => v.replace(/[^\d]/g, "").replace(/^91(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number."));

const freeText = (label: string, min: number, max: number) =>
  z
    .string({ required_error: `${label} is required.` })
    .transform(clean)
    .pipe(z.string().min(min, `${label} is required.`).max(max, `${label} is too long.`));

export const password = z
  .string({ required_error: "Password is required." })
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.")
  .regex(/[a-z]/, "Add at least one lowercase letter.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/[0-9]/, "Add at least one number.")
  .regex(/[^A-Za-z0-9]/, "Add at least one symbol.");

export const YEAR_VALUES = ["1st Year", "2nd Year", "3rd Year", "4th Year", "PG"] as const;

export const registerSchema = z
  .object({
    name,
    email,
    phone,
    password,
    confirmPassword: z.string().min(1, "Please confirm your password."),
    college: freeText("College name", 2, 120),
    department: freeText("Department", 2, 80),
    year: z.enum(YEAR_VALUES),
    rollNumber: z
      .string({ required_error: "Roll number is required." })
      .transform((v) => v.trim().toUpperCase())
      .pipe(
        z
          .string()
          .regex(/^[A-Z0-9/-]{3,24}$/, "Enter a valid roll number (3–24 letters/numbers)."),
      ),
    eventIds: z
      .array(z.string().min(10, "Invalid event.").max(64, "Invalid event."))
      .min(1, "Select at least one event.")
      .max(6, "You can select up to 6 events.")
      .refine((ids) => new Set(ids).size === ids.length, "Duplicate events selected."),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: "Please accept the code of conduct." }) }),
    turnstileToken: z.string().max(2048).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/** Step-level schemas used by the multi-step registration form. */
export const registerIdentitySchema = z
  .object({
    name,
    email,
    phone,
    password,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const registerAcademicSchema = z.object({
  college: freeText("College name", 2, 120),
  department: freeText("Department", 2, 80),
  year: z.enum(YEAR_VALUES),
  rollNumber: z
    .string({ required_error: "Roll number is required." })
    .transform((v) => v.trim().toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9/-]{3,24}$/, "Enter a valid roll number (3–24 letters/numbers).")),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(128),
  turnstileToken: z.string().max(2048).optional(),
});

export const forgotPasswordSchema = z.object({
  email,
  turnstileToken: z.string().max(2048).optional(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20, "Invalid reset link.").max(200),
    password,
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(20, "Invalid verification link.").max(200),
});

export const resendVerificationSchema = z.object({ email });

export const updateProfileSchema = z.object({
  name,
  phone,
  college: freeText("College name", 2, 120),
  department: freeText("Department", 2, 80),
  year: z.enum(YEAR_VALUES),
  rollNumber: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9/-]{3,24}$/, "Enter a valid roll number.")),
});

export const addEventsSchema = z.object({
  eventIds: z
    .array(z.string().min(10).max(64))
    .min(1, "Select at least one event.")
    .max(6, "You can select up to 6 events.")
    .refine((ids) => new Set(ids).size === ids.length, "Duplicate events selected."),
});

export const contactSchema = z.object({
  name,
  email,
  subject: freeText("Subject", 3, 120),
  message: freeText("Message", 20, 2000),
  turnstileToken: z.string().max(2048).optional(),
});

export const eventCategorySchema = z.nativeEnum({
  TECHNICAL: "TECHNICAL",
  NON_TECHNICAL: "NON_TECHNICAL",
  WORKSHOP: "WORKSHOP",
  CULTURAL: "CULTURAL",
} as const);

export const eventQuerySchema = z.object({
  q: z.string().max(100).optional(),
  department: z.string().max(80).optional(),
  category: eventCategorySchema.optional(),
  day: z.coerce.number().int().min(1).max(3).optional(),
});

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time (HH:MM).");

export const adminEventSchema = z.object({
  title: freeText("Title", 3, 120),
  description: freeText("Description", 20, 3000),
  category: eventCategorySchema,
  departmentId: z.string().min(10, "Choose a department."),
  day: z.coerce.number().int().min(1).max(3),
  startTime: time,
  endTime: time,
  venue: freeText("Venue", 2, 120),
  prize: freeText("Prize", 1, 160),
  rules: z.array(z.string().transform(clean).pipe(z.string().min(3).max(300))).max(20).default([]),
  coordinators: z
    .array(
      z.object({
        name: freeText("Coordinator name", 2, 80),
        phone,
      }),
    )
    .max(4)
    .default([]),
  capacity: z.coerce.number().int().min(1).max(2000),
  teamSize: freeText("Team size", 1, 30),
  fee: z.coerce.number().int().min(0).max(10000),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const adminDepartmentSchema = z.object({
  name: freeText("Name", 2, 100),
  shortName: freeText("Short name", 2, 12).transform((v) => v.toUpperCase()),
  slug: z
    .string()
    .transform((v) => v.toLowerCase().trim())
    .pipe(z.string().regex(/^[a-z0-9-]{2,40}$/, "Use lowercase letters, numbers and dashes.")),
  description: freeText("Description", 10, 500),
  tagline: z.string().transform(clean).pipe(z.string().max(120)).optional().or(z.literal("")),
  accent: z.enum(["cyan", "magenta", "orange", "purple", "lime", "blue", "pink", "amber"]).default("cyan"),
  icon: z.string().max(30).default("cpu"),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export const adminRegistrationQuerySchema = z.object({
  q: z.string().max(100).optional(),
  college: z.string().max(120).optional(),
  department: z.string().max(80).optional(),
  eventId: z.string().max(64).optional(),
  attended: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const attendanceSchema = z.object({
  qr: z.string().min(10, "Scan or paste a QR payload.").max(200),
  eventId: z.string().max(64).optional(),
});

export const categoryLabelSchema = z.enum(Object.keys(CATEGORY_LABELS) as [keyof typeof CATEGORY_LABELS]);
