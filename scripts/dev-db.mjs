import { existsSync } from "node:fs";
import process from "node:process";
import { startEmbeddedPostgres } from "./lib/embedded.mjs";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    try {
      process.loadEnvFile(file);
      break;
    } catch {
      /* ignore */
    }
  }
}

const db = await startEmbeddedPostgres();
console.log("\n[db] Press Ctrl+C to stop.\n");

const shutdown = async () => {
  await db.stop();
  process.exit(0);
};
process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
await new Promise(() => {});
