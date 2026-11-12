/* DANGER: drops and recreates the local embedded database in UTF-8.
 * Only intended for the local development cluster. Run: node scripts/reset-db.mjs
 */
import { existsSync } from "node:fs";
import process from "node:process";
import pg from "pg";

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

const url = new URL(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:55432/neonova");
const dbName = url.pathname.replace(/^\//, "") || "neonova";
if (!process.argv.includes("--yes")) {
  console.error(`This will DROP database "${dbName}". Re-run with --yes to continue.`);
  process.exit(1);
}

const client = new pg.Client({
  host: url.hostname,
  port: Number(url.port || 5432),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: "postgres",
});

await client.connect();
await client.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
await client.query(`CREATE DATABASE "${dbName}" WITH ENCODING 'UTF8' TEMPLATE template0`);
const result = await client.query(
  "SELECT pg_encoding_to_char(encoding) AS encoding FROM pg_database WHERE datname = $1",
  [dbName],
);
console.log(`Recreated ${dbName} with encoding ${result.rows[0]?.encoding}`);
await client.end();
