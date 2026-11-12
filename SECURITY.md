# Security policy

suNRIseevent '27 handles student accounts, contact details and college ID documents. This document describes the security model, how to report a problem, and the checks required before going live.

## Reporting a vulnerability

**Do not open a public issue for security problems.**

Email **security@sunriseevent.in** with:

- A description of the issue and the affected route or component
- Reproduction steps or a proof of concept
- The potential impact
- Whether any real participant data may have been exposed

You should receive an acknowledgement within 72 hours. Please allow time for a fix before public disclosure. Good-faith research that respects participant privacy and does not degrade the service is welcome.

## Supported versions

Only the latest production deployment is supported. There are no maintained older branches.

---

## Security model

### Authentication

- Passwords are hashed with **bcrypt** (cost 12) and never logged or returned.
- Access tokens are short-lived **HS256 JWTs** (`jose`) with issuer `sunriseevent` and audience `sunriseevent-web`.
- Refresh tokens are random 32-byte values stored as **HMAC-SHA256 hashes**.
- Refresh tokens **rotate on every use**. Presenting a rotated token again is treated as theft and revokes the user's entire session family.
- Accounts lock temporarily after repeated failed logins; attempts are rate limited by IP and account.
- Email verification is required before sensitive actions (`requireVerifiedUser`).
- Roles are enforced **server-side** (`requireAdmin`, admin layout guard). Middleware only performs a cheap cookie-presence gate and never replaces a real authorization check.

### Cookies and CSRF

- `neo_access` and `neo_refresh` are `httpOnly`, `SameSite=Lax`, `Secure` in production.
- `neo_csrf` is a readable double-submit token. Every state-changing API call validates it against the header sent by `apiFetch` and, in production, rejects cross-origin requests.
- CSRF checking is bypassed only when `NODE_ENV === "test"`.

### Input and output

- All request bodies are validated with **Zod** schemas, including type coercion, length caps and normalisation.
- JSON bodies are size-limited; malformed or unknown fields are rejected.
- Prisma parameterises every query. The only raw SQL is the generated baseline migration.
- CSV exports quote every cell and prefix `=`, `+`, `-`, `@` and tab characters to prevent formula injection.
- React escapes rendered content by default. The few `dangerouslySetInnerHTML` usages are limited to JSON-LD generated from trusted local data.

### Uploads

- Only JPG, PNG and PDF are accepted.
- Declared MIME type, extension, **magic bytes** and size (5 MB) are all checked.
- Files are renamed with random bytes and written outside the public web root with `0600` permissions.
- Download is restricted to authenticated admins and uses a sanitised `Content-Disposition` filename.
- Stored names are validated against path traversal before every read.

### Abuse prevention

- In-memory sliding-window limits protect login, registration, password reset, contact, attendance scanning, profile updates and other sensitive endpoints.
- Optional Cloudflare Turnstile protects registration, login, password reset and contact in production. Development bypasses captcha only when both Turnstile keys are empty.
- Security events (login failure, lockout, token reuse, attendance scan, admin mutation, profile update) are written to an audit log.

### HTTP hardening

`next.config.ts` sets:

- Content-Security-Policy with explicit allowlists
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` and `frame-ancestors 'none'`
- Strict-Transport-Security in production
- Referrer-Policy, Permissions-Policy and cross-origin isolation headers
- `poweredByHeader: false`

Authenticated pages are marked `noindex`.

---

## Production checklist

- [ ] Generate unique 48-byte secrets for `AUTH_SECRET`, `REFRESH_TOKEN_PEPPER` and `QR_SECRET`; never reuse the example values.
- [ ] Set `APP_URL`, `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin.
- [ ] Use a managed PostgreSQL instance with TLS and least-privilege credentials.
- [ ] Run `npx prisma migrate deploy`; do not use `db push` in production.
- [ ] Remove or rotate the seeded demo accounts.
- [ ] Configure Turnstile keys and verify the captcha challenge is enforced.
- [ ] Configure SMTP or Resend; confirm verification and reset emails deliver.
- [ ] Move college-ID storage to private object storage (S3/R2) with short-lived signed URLs.
- [ ] Replace the in-memory rate limiter with Redis for multi-instance deployments.
- [ ] Terminate TLS at the platform edge and keep HSTS enabled.
- [ ] Add uptime and error monitoring (e.g. Sentry) and alert on 5xx spikes and auth failures.
- [ ] Restrict database and admin console access to organizers; use individual admin accounts.
- [ ] Review the data retention periods in `/privacy` and schedule deletion jobs.
- [ ] Run `npm audit`, `npm test`, `npx tsc --noEmit`, `npm run lint` and `npm run build` before release.
- [ ] Take and test a database backup before the fest weekend.

---

## Known limitations

- **Rate limiting is per-process.** Serverless or horizontally scaled deployments need a shared Redis store.
- **CSP allows `'unsafe-inline'` for scripts** because Next.js injects bootstrap scripts. Move to a nonce-based policy if the deployment supports it.
- **Uploads are local-disk by default.** Serverless filesystems are ephemeral and not shared between instances.
- **Audit logs are database rows**, not tamper-evident. Ship them to append-only storage for high-assurance use.
- **Email deliverability** depends on correct SPF, DKIM and DMARC records for the sending domain.

## Incident response

1. Contain: revoke affected sessions, rotate secrets and disable compromised admin accounts.
2. Assess: identify affected records using audit logs and database history.
3. Notify: inform the university's data protection contact and affected participants where required.
4. Remediate: patch, test and redeploy; verify with a focused regression test.
5. Review: document the root cause and add preventive controls.
