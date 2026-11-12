import net from "node:net";
import path from "node:path";
import { existsSync } from "node:fs";

/** Check whether a TCP port is already accepting connections. */
export function isPortOpen(port, host = "127.0.0.1", timeout = 900) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const done = (result) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeout);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

/**
 * Starts the embedded Postgres used by `npm run dev` when no database is
 * already reachable on the configured local port. Managed/remote databases are
 * never touched.
 */
export async function startEmbeddedPostgres() {
  const port = Number(process.env.EMBEDDED_DB_PORT || 55432);
  const databaseUrl = process.env.DATABASE_URL || "";
  const dbName = (() => {
    try {
      return new URL(databaseUrl).pathname.replace(/^\//, "") || "neonova";
    } catch {
      return "neonova";
    }
  })();

  if (await isPortOpen(port)) {
    console.log(`[db] Postgres already reachable on port ${port} — reusing it.`);
    return { started: false, stop: async () => {} };
  }

  const databaseDir = path.resolve(process.env.EMBEDDED_DB_DIR || "./storage/db");
  const { default: EmbeddedPostgres } = await import("embedded-postgres");

  const pg = new EmbeddedPostgres({
    databaseDir,
    user: "postgres",
    password: "postgres",
    port,
    persistent: true,
    autoRehydrateSymlinks: true,
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    onLog: process.env.DEBUG_DB === "true" ? console.log : () => {},
    onError: (error) => console.error("[db]", error?.message ?? error),
  });

  if (!existsSync(path.join(databaseDir, "PG_VERSION"))) {
    console.log("[db] Initialising embedded Postgres cluster…");
    await pg.initialise();
  }

  await pg.start();
  try {
    await pg.createDatabase(dbName);
    console.log(`[db] Created database "${dbName}".`);
  } catch (error) {
    if (!/already exists/i.test(String(error?.message))) {
      console.warn("[db] createDatabase:", error?.message ?? error);
    }
  }
  console.log(`[db] Embedded Postgres ready on localhost:${port} (db: ${dbName}).`);

  return {
    started: true,
    stop: async () => {
      try {
        await pg.stop();
        console.log("[db] Embedded Postgres stopped.");
      } catch {
        /* process is exiting */
      }
    },
  };
}
