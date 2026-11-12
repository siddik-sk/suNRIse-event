# suNRIseevent '27

The official website and organizer platform for **suNRIseevent '27**, the annual inter-college techno-cultural festival of **NRI University, Agiripalli, near Vijayawada, Andhra Pradesh** — 19–21 February 2027.

Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma and PostgreSQL.

---

## What is included

### Public festival site

- Cinematic animated hero, highlights, gallery, schedule preview and sponsor sections
- Full event directory with search and filters by day, department and category
- Event detail pages with rules, coordinators, prize details, JSON-LD and related events
- Department hubs, three-day schedule with print view, sponsors, team, FAQ, contact
- Code of conduct and privacy policy
- SEO: metadata, Open Graph image, sitemap, robots and structured data
- Accessibility-minded UI with reduced-motion support and keyboard-friendly controls

### Student experience

- Multi-step registration with college ID upload, email verification and Passport-style QR pass
- Dashboard with pass download, event selection (up to six), clash detection and profile management
- Rotating refresh-token sessions with CSRF protection

### Organizer console (`/admin`)

- Live KPI overview and Recharts analytics (7-day trend, category mix, department demand, top events)
- Searchable, filterable registration table with per-student event history and secure college-ID access
- Filtered CSV export with spreadsheet formula-injection protection
- Event CRUD, publishing controls and capacity management
- Department CRUD with accent/icon configuration
- Camera QR scanner (`@zxing/browser`) with manual pass-ID fallback and per-event attendance marking

---

## Tech stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Framework  | Next.js 15.5 (App Router, route handlers, server components)  |
| UI         | React 19, Tailwind CSS, Framer Motion, Three.js, Recharts      |
| Data       | PostgreSQL + Prisma 6                                          |
| Auth       | JWT access tokens (jose), rotating refresh sessions, bcryptjs  |
| Validation | Zod                                                            |
| QR         | `qrcode` generation, `@zxing/browser` scanning                 |
| Email      | Nodemailer (SMTP) or Resend API                                |
| Testing    | Vitest                                                         |

---

## Quick start (local)

### Requirements

- Node.js **20.9+** (22 LTS recommended)
- npm 10+
- Optional: Docker for a full PostgreSQL container

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `.env` and replace every `replace-me-*` secret. Generate strong values with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

`AUTH_SECRET` must be at least 32 characters. Use different values for `AUTH_SECRET`, `REFRESH_TOKEN_PEPPER` and `QR_SECRET`.

### 3. Run

```bash
npm run dev
```

`npm run dev` starts an embedded PostgreSQL instance on port `55432` (data in `storage/db`), syncs the Prisma schema, seeds sample data on first run, then starts Next.js.

- Frontend and APIs: **http://localhost:3000**
- Health check: **http://localhost:3000/api/health**
- API base: **http://localhost:3000/api**

To use your own Postgres instead, set `DATABASE_URL` in `.env` and run:

```bash
npx prisma migrate deploy   # or: npm run db:push
npm run db:seed
npm run dev:next
```

### Demo accounts (seeded)

| Role    | Email                     | Password         |
| ------- | ------------------------- | ---------------- |
| Admin   | `admin@sunriseevent.in`   | `Admin@Sunrise27` |
| Student | `student@sunriseevent.in` | `Student@Sunrise27` |

The seeded student pass uses the demo QR token `SUNRISE27:demo-qr-token-sunriseevent-2027-abcdef`.

> Change or remove demo accounts before going live. Set `SEED_ADMIN_PASSWORD` / `SEED_STUDENT_PASSWORD` before seeding.

---

## npm scripts

| Script              | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Embedded Postgres + schema sync + seed + Next dev     |
| `npm run dev:next`  | Next.js dev server only (uses `DATABASE_URL`)         |
| `npm run dev:db`    | Embedded Postgres only                               |
| `npm run build`     | `prisma generate` + production build                 |
| `npm start`         | Production server (`next start`)                     |
| `npm run db:push`   | Push Prisma schema without a migration              |
| `npm run db:migrate`| Create/apply a development migration                 |
| `npm run db:seed`   | Seed departments, events, demo accounts              |
| `npm run db:studio` | Prisma Studio                                        |
| `npm test`          | Run the Vitest suite                                 |
| `npm run lint`      | ESLint via `next lint`                               |

---

## Routes

### Public

| Route                  | Description                          |
| ---------------------- | ------------------------------------ |
| `/`                    | Landing page                         |
| `/events`              | Filterable event directory           |
| `/events/[slug]`       | Event detail                         |
| `/departments`         | Department directory                 |
| `/departments/[slug]`  | Department hub                       |
| `/schedule`            | Three-day schedule                   |
| `/sponsors`            | Partners                             |
| `/team`                | Organizing crew                      |
| `/faq`                 | FAQ                                  |
| `/contact`             | Contact form + map                   |
| `/code-of-conduct`     | Community standards                  |
| `/privacy`             | Privacy policy                       |
| `/register`            | Student registration                 |
| `/login`               | Sign in                              |
| `/forgot-password`     | Password reset request               |
| `/reset-password`      | Password reset                       |
| `/verify-email`        | Email verification                   |

### Student (auth required)

`/dashboard`, `/dashboard/events`, `/dashboard/pass`, `/dashboard/profile`

### Admin (ADMIN role required)

`/admin`, `/admin/registrations`, `/admin/events`, `/admin/departments`, `/admin/attendance`

### API

Public: `/api/events`, `/api/departments`, `/api/health`, `/api/csrf`

Auth: `/api/auth/*`, `/api/registrations`, `/api/profile`, `/api/contact`

Admin: `/api/admin/stats`, `/api/admin/registrations`, `/api/admin/registrations/export`, `/api/admin/events`, `/api/admin/departments`, `/api/admin/attendance`, `/api/admin/uploads/[id]`

---

## Project structure

```text
prisma/
  schema.prisma          Database models
  seed.ts                Departments, events and demo users
  migrations/            Baseline SQL migration
src/
  app/
    (site)/              Public pages
    (auth)/              Login, register, verification
    (dashboard)/         Student dashboard
    (admin)/admin/       Organizer console
    api/                 Route handlers
  components/            UI, sections, forms, admin widgets
  lib/
    auth/                Tokens + server session helpers
    security/            Rate limiting, uploads, captcha, audit
    validation/          Zod schemas
    data.ts              Public data access
scripts/                 Embedded Postgres and dev helpers
tests/                   Vitest unit tests
storage/                 Local uploads, mail logs, embedded DB (gitignored)
```

---

## Testing

```bash
npm test
```

Covers identifier/QR tokens, JWT signing, Zod validation, schedule conflicts, rate limiting, upload validation and admin filter composition.

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Docker

A Postgres service and the app are defined in `docker-compose.yml`.

```bash
cp .env.example .env          # set secrets
docker compose up --build
docker compose exec app npm run db:seed
```

The app runs migrations on start. Uploaded college IDs live in the `uploads` volume; PostgreSQL data lives in the `db` volume.

The standalone `Dockerfile` expects `DATABASE_URL`, `AUTH_SECRET`, `REFRESH_TOKEN_PEPPER`, `QR_SECRET` and `APP_URL` at runtime.

---

## Deployment notes

### Vercel + managed Postgres (Neon/Supabase)

1. Create a PostgreSQL database and copy its pooled connection string into `DATABASE_URL`.
2. Add every variable from `.env.example` in the Vercel project settings.
3. Set `APP_URL` and `NEXT_PUBLIC_APP_URL` to the production origin.
4. Run `npx prisma migrate deploy` against the production database once.
5. Deploy. Do **not** seed demo accounts in production.

### Uploads

College IDs are written to `storage/college-ids` on the local filesystem. On serverless platforms (including Vercel) this directory is ephemeral. For production, point `saveCollegeId` / `readCollegeId` at S3, Cloudflare R2 or another private object store before accepting real uploads.

### Rate limiting

The in-memory limiter is suitable for a single Node process. For multi-instance or serverless deployments, swap `src/lib/security/rate-limit.ts` for a Redis-backed adapter (see `SECURITY.md`).

---

## Customising the fest

Most editorial content lives in `src/lib/fest.ts`: name, dates, venue, contact details, stats, FAQ, team and sponsors. Events and departments are database records managed from `/admin` or `prisma/seed.ts`.

Technical identifiers (`SUN27-` pass IDs, `SUNRISE27:` QR prefix) live in `src/lib/auth/tokens.ts`.

---

## License

Private project for NRI University. All rights reserved.
