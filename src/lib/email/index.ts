import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";
import QRCode from "qrcode";
import { FEST } from "@/lib/fest";
import { absoluteUrl } from "@/lib/utils";

type Attachment = { filename: string; content: Buffer; cid?: string; contentType?: string };

type MailOptions = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: Attachment[];
};

const FROM = process.env.MAIL_FROM || "suNRIseevent '27 <no-reply@sunriseevent.in>";
const MAIL_DIR = path.join(process.cwd(), "storage", "mail");

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Shared neon email shell. Inline CSS only — email clients strip <style>. */
function layout(title: string, body: string) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#05010d;color:#e9e3ff;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05010d;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#0d0620;border:1px solid #2b1854;border-radius:20px;overflow:hidden;">
        <tr><td style="padding:28px 32px;background:linear-gradient(110deg,#ff2d95,#ff8a00 35%,#8b5cf6 70%,#00f0ff);">
          <div style="font-size:12px;letter-spacing:6px;color:#05010d;font-weight:800;">NRI UNIVERSITY</div>
          <div style="font-size:34px;line-height:1.1;font-weight:900;letter-spacing:2px;color:#05010d;margin-top:6px;">suNRIseevent '27</div>
          <div style="font-size:13px;color:#1b0b2e;font-weight:600;margin-top:4px;">${FEST.datesLabel} · ${FEST.city}</div>
        </td></tr>
        <tr><td style="padding:34px 32px;">${body}</td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #241344;color:#8f83b8;font-size:12px;line-height:1.6;">
          ${FEST.fullName} · ${FEST.college}, ${FEST.city}<br>
          Questions? Reply to this email or write to ${FEST.email}.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

let transporter: Transporter | null = null;

function smtpConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
  }
  return transporter;
}

async function writeDevPreview(mail: MailOptions) {
  await mkdir(MAIL_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(MAIL_DIR, `${stamp}-${mail.to.replace(/[^\w.-]/g, "_")}.html`);
  let html = mail.html;
  for (const attachment of mail.attachments ?? []) {
    if (attachment.cid) {
      const dataUri = `data:${attachment.contentType || "image/png"};base64,${attachment.content.toString("base64")}`;
      html = html.replaceAll(`cid:${attachment.cid}`, dataUri);
    }
  }
  await writeFile(
    file,
    `<!-- To: ${escapeHtml(mail.to)} | Subject: ${escapeHtml(mail.subject)} -->\n${html}`,
    "utf8",
  );
  console.info(`[mail:dev] "${mail.subject}" → ${mail.to}`);
  console.info(`[mail:dev] preview: ${file}`);
}

async function sendViaResend(mail: MailOptions) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: mail.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content.toString("base64"),
        content_id: a.cid,
      })),
    }),
  });
  if (!res.ok) throw new Error(`Resend error ${res.status}`);
}

/** Send email through Resend → SMTP → local preview file (dev only). */
export async function sendMail(mail: MailOptions): Promise<boolean> {
  try {
    if (process.env.RESEND_API_KEY) {
      await sendViaResend(mail);
      return true;
    }
    if (smtpConfigured()) {
      await getTransporter().sendMail({
        from: FROM,
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        attachments: mail.attachments,
      });
      return true;
    }
    if (process.env.NODE_ENV === "production") {
      console.error("[mail] No email provider configured in production");
      return false;
    }
    await writeDevPreview(mail);
    return true;
  } catch (error) {
    console.error("[mail] delivery failed:", error instanceof Error ? error.message : "unknown");
    return false;
  }
}

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;margin:22px 0;padding:14px 26px;border-radius:999px;background:linear-gradient(110deg,#ff2d95,#8b5cf6,#00f0ff);color:#fff;font-weight:800;text-decoration:none;letter-spacing:.4px;">${label}</a>`;

export async function sendVerificationEmail(to: string, name: string, token: string, userId?: string) {
  const link = absoluteUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  if (process.env.NODE_ENV !== "production") console.info(`[auth:dev] Verify email for ${to}: ${link}`);
  await sendMail({
    to,
    subject: `Verify your email · ${FEST.fullName}`,
    html: layout(
      "Verify your email",
      `<p style="font-size:17px;margin:0 0 8px;">Hey ${escapeHtml(name.split(" ")[0])},</p>
       <p style="color:#c7bde8;line-height:1.7;">You're one click away from your suNRIseevent '27 pass. Verify your email to activate your account.</p>
       ${button(link, "Verify my email →")}
       <p style="color:#8f83b8;font-size:13px;line-height:1.7;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
       <p style="color:#5e5482;font-size:11px;word-break:break-all;">${escapeHtml(link)}</p>`,
    ),
    text: `Verify your suNRIseevent '27 email: ${link}`,
  });
  void userId;
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const link = absoluteUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  if (process.env.NODE_ENV !== "production") console.info(`[auth:dev] Reset password for ${to}: ${link}`);
  await sendMail({
    to,
    subject: `Reset your password · ${FEST.fullName}`,
    html: layout(
      "Reset password",
      `<p style="font-size:17px;">Hi ${escapeHtml(name.split(" ")[0])},</p>
       <p style="color:#c7bde8;line-height:1.7;">We received a request to reset your suNRIseevent account password. This link expires in 60 minutes.</p>
       ${button(link, "Choose a new password →")}
       <p style="color:#8f83b8;font-size:13px;">If you didn't request this, no action is needed — your password stays unchanged.</p>`,
    ),
    text: `Reset your suNRIseevent '27 password: ${link}`,
  });
}

export async function sendRegistrationConfirmation(opts: {
  to: string;
  name: string;
  registrationId: string;
  qrToken: string;
  events: { title: string; day: number; startTime: string; venue: string }[];
}) {
  const passUrl = absoluteUrl("/dashboard");
  const qrBuffer = await QRCode.toBuffer(`SUNRISE27:${opts.qrToken}`, {
    width: 520,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#05010d", light: "#ffffff" },
  });
  const eventRows = opts.events
    .map(
      (event) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #241344;color:#e9e3ff;font-size:14px;">Day ${event.day} · ${escapeHtml(event.startTime)}</td><td style="padding:8px 0;border-bottom:1px solid #241344;color:#c7bde8;font-size:14px;">${escapeHtml(event.title)}</td><td style="padding:8px 0;border-bottom:1px solid #241344;color:#8f83b8;font-size:12px;">${escapeHtml(event.venue)}</td></tr>`,
    )
    .join("");

  await sendMail({
    to: opts.to,
    subject: `You're in! Pass ${opts.registrationId} · ${FEST.fullName}`,
    html: layout(
      "Your pass",
      `<p style="font-size:17px;margin:0;">Welcome to the grid, ${escapeHtml(opts.name.split(" ")[0])}.</p>
       <p style="color:#c7bde8;line-height:1.7;">Your registration is confirmed. Here is your all-access QR pass.</p>
       <div style="text-align:center;background:#fff;border-radius:18px;padding:18px;margin:22px 0;">
         <img src="cid:festqr" alt="suNRIseevent QR pass" width="220" height="220" style="display:block;margin:0 auto;">
         <div style="color:#05010d;font-family:monospace;font-size:20px;letter-spacing:3px;font-weight:800;margin-top:10px;">${opts.registrationId}</div>
       </div>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 18px;">${eventRows}</table>
       ${button(passUrl, "Open my dashboard →")}
       <p style="color:#8f83b8;font-size:13px;">Show this QR at the help desk. Don't share it — it is unique to you.</p>`,
    ),
    text: `Registration ${opts.registrationId} confirmed for ${FEST.fullName}. Open ${passUrl} for your QR pass.`,
    attachments: [{ filename: "sunriseevent-pass.png", content: qrBuffer, cid: "festqr", contentType: "image/png" }],
  });
}

export async function sendContactAutoReply(to: string, name: string, subject: string) {
  await sendMail({
    to,
    subject: `We got your message · ${FEST.fullName}`,
    html: layout(
      "Message received",
      `<p style="font-size:17px;">Hi ${escapeHtml(name.split(" ")[0])},</p>
       <p style="color:#c7bde8;line-height:1.7;">Thanks for writing to us about <strong style="color:#00f0ff;">${escapeHtml(subject)}</strong>. The suNRIseevent crew will get back to you within 48 hours.</p>
       <p style="color:#8f83b8;font-size:13px;">Meanwhile, keep an eye on your inbox for schedule drops.</p>`,
    ),
    text: `Thanks for contacting suNRIseevent '27. We'll reply within 48 hours.`,
  });
}
