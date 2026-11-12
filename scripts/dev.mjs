import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";
import { startEmbeddedPostgres } from "./lib/embedded.mjs";

// Load .env for scripts (Next.js loads it for the app itself).
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    try {
      process.loadEnvFile(file);
      break;
    } catch {
      /* older Node */
    }
  }
}

function run(command, args, label) {
  return new Promise((resolve, reject) => {
    console.log(`\n[dev] ${label}`);
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} exited with code ${code}`));
    });
  });
}

async function main() {
  let db = { started: false, stop: async () => {} };
  try {
    db = await startEmbeddedPostgres();
  } catch (error) {
    console.error("[dev] Could not start embedded Postgres:", error?.message ?? error);
    console.error("[dev] Start Docker/Postgres manually or point DATABASE_URL at a managed database.");
    process.exit(1);
  }

  const shutdown = async (signal) => {
    console.log(`\n[dev] ${signal} — shutting down…`);
    await db.stop();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    // Keep schema in sync. For production use `prisma migrate deploy`.
    await run("npx", ["prisma", "db", "push", "--skip-generate"], "Syncing database schema…");

    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const count = await prisma.department.count().catch(() => 0);
    await prisma.$disconnect();

    if (count === 0 || process.env.SEED_FORCE === "true") {
      await run("npx", ["tsx", "prisma/seed.ts"], "Seeding sample data…");
    } else {
      console.log("[dev] Seed data already present — skipping seed.");
    }

    console.log("\n[dev] Starting Next.js on http://localhost:3000\n");
    const next = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev"], {
      stdio: "inherit",
      env: process.env,
      shell: process.platform === "win32",
    });

    next.on("exit", async (code) => {
      await db.stop();
      process.exit(code ?? 0);
    });
  } catch (error) {
    console.error("[dev]", error?.message ?? error);
    await db.stop();
    process.exit(1);
  }
}

void main();
