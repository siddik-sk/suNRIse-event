import { assertCsrf, json, parseJson, withApi } from "@/lib/api";
import { sendContactAutoReply } from "@/lib/email";
import prisma from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/audit";
import { verifyCaptcha } from "@/lib/security/captcha";
import { getClientIp, rateLimitOrThrow } from "@/lib/security/rate-limit";
import { contactSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  assertCsrf(req);
  const ip = getClientIp(req);
  rateLimitOrThrow(`contact:ip:${ip}`, 5, 60 * 60 * 1000);

  const input = await parseJson(req, contactSchema, 16 * 1024);
  await verifyCaptcha(input.turnstileToken, req);

  const message = await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      ip,
    },
  });

  await sendContactAutoReply(input.email, input.name, input.subject);
  await logSecurityEvent({ action: "CONTACT_MESSAGE", detail: `Message ${message.id}`, req });

  return json({ ok: true, message: "Message received. We'll get back to you within 48 hours." }, { status: 201 });
});
