import { ApiError, assertCsrf, json, withApi } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { safeUserSelect } from "@/lib/auth/session";
import { hashToken, randomToken } from "@/lib/auth/tokens";
import { sendRegistrationConfirmation, sendVerificationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { createFestRegistration, findScheduleConflict, loadSelectableEvents } from "@/lib/registrations";
import { verifyCaptcha } from "@/lib/security/captcha";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";
import { deleteCollegeId, MAX_UPLOAD_BYTES, saveCollegeId, type StoredUpload } from "@/lib/security/upload";
import { registerSchema } from "@/lib/validation/schemas";
import { logSecurityEvent } from "@/lib/security/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/register
 * multipart/form-data:
 *   data       — JSON string matching registerSchema
 *   collegeId  — optional JPG/PNG/PDF, max 5 MB
 */
export const POST = withApi(async (req) => {
  assertCsrf(req);

  const ip = getClientIp(req);
  rateLimitOrThrow(`register:ip:${ip}`, 10, 60 * 60 * 1000);

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    throw new ApiError(415, "Use multipart/form-data for registration.", "UNSUPPORTED_MEDIA");
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength && contentLength > MAX_UPLOAD_BYTES + 256 * 1024) {
    throw new ApiError(413, "Your upload is too large.", "PAYLOAD_TOO_LARGE");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(400, "Could not read the registration form.", "BAD_FORM");
  }

  const dataRaw = form.get("data");
  if (typeof dataRaw !== "string") throw new ApiError(400, "Registration details are missing.", "BAD_FORM");

  let parsed: unknown;
  try {
    parsed = JSON.parse(dataRaw);
  } catch {
    throw new ApiError(400, "Registration details are malformed.", "BAD_JSON");
  }

  const input = registerSchema.parse(parsed);
  rateLimitOrThrow(`register:email:${input.email}`, 5, 60 * 60 * 1000);

  await verifyCaptcha(input.turnstileToken, req);

  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists. Try logging in instead.", "EMAIL_EXISTS");
  }

  // Validate events and clashes before creating anything.
  const events = await loadSelectableEvents(input.eventIds);
  const conflict = findScheduleConflict(events);
  if (conflict) throw new ApiError(409, conflict, "SCHEDULE_CONFLICT");

  const file = form.get("collegeId");
  let upload: StoredUpload | null = null;
  if (typeof File !== "undefined" && file instanceof File && file.size > 0) {
    upload = await saveCollegeId(file);
  }

  let createdUserId: string | null = null;

  try {
    const passwordHash = await hashPassword(input.password);
    const verificationRaw = randomToken(32);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        phone: input.phone,
        college: input.college,
        department: input.department,
        year: input.year,
        rollNumber: input.rollNumber,
        emailVerified: false,
        verification: {
          create: {
            tokenHash: hashToken(verificationRaw),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
        ...(upload
          ? {
              uploads: {
                create: {
                  originalName: upload.originalName,
                  storedName: upload.storedName,
                  mimeType: upload.mimeType,
                  size: upload.size,
                  kind: "COLLEGE_ID",
                },
              },
            }
          : {}),
      },
      select: safeUserSelect,
    });
    createdUserId = user.id;

    const registration = await createFestRegistration(user.id, input.eventIds);
    const registrationEvents = registration.eventRegistrations.map(({ event }) => ({
      title: event.title,
      day: event.day,
      startTime: event.startTime,
      venue: event.venue,
    }));

    await Promise.all([
      sendVerificationEmail(user.email, user.name, verificationRaw, user.id),
      sendRegistrationConfirmation({
        to: user.email,
        name: user.name,
        registrationId: registration.registrationId,
        qrToken: registration.qrToken,
        events: registrationEvents,
      }),
    ]);

    await logSecurityEvent({
      action: "REGISTER",
      detail: `Registration ${registration.registrationId} created with ${input.eventIds.length} events.`,
      userId: user.id,
      req,
    });

    return json(
      {
        ok: true,
        email: user.email,
        registrationId: registration.registrationId,
        requiresVerification: true,
        message:
          "You're in! Check your email to verify your account and download your QR pass.",
      },
      { status: 201 },
    );
  } catch (error) {
    // Roll back partial provisioning so a retry is clean.
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    if (upload) await deleteCollegeId(upload.storedName);
    throw error;
  }
});
