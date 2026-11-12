# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# suNRIseevent '27 — production image
# Prisma needs OpenSSL at both build and runtime on slim Debian images.
# ---------------------------------------------------------------------------

FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
ENV NEXT_TELEMETRY_DISABLED=1

# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time placeholders. Real values are injected at runtime.
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sunriseevent?schema=public"
ENV AUTH_SECRET="build-only-placeholder-secret-change-me-1234567890"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"

RUN npx prisma generate && npm run build

# ---------------------------------------------------------------------------
# Runtime
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# The full node_modules tree is copied so Prisma CLI, migrations and the seed
# script are available for `docker compose exec app ...` maintenance commands.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma

COPY public ./public

RUN mkdir -p storage/college-ids storage/mail \
  && chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((r)=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["npm", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
