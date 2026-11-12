import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { Prisma } from "@prisma/client";

/** Errors thrown by API handlers that are safe to expose to clients. */
export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, message: string, code = "API_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { "Cache-Control": "no-store", ...(init?.headers ?? {}) },
  });
}

export function apiError(error: unknown) {
  if (error instanceof ApiError) {
    return json({ ok: false, error: error.message, code: error.code }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return json(
      { ok: false, error: "Please check the highlighted fields.", code: "VALIDATION_ERROR", fieldErrors },
      { status: 422 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return json(
        { ok: false, error: "That record already exists.", code: "CONFLICT" },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return json({ ok: false, error: "Record not found.", code: "NOT_FOUND" }, { status: 404 });
    }
  }

  // Never leak stack traces, SQL, or internal messages.
  console.error("[api] unhandled error", error instanceof Error ? error.message : "unknown");
  return json({ ok: false, error: "Something went wrong. Please try again.", code: "INTERNAL" }, { status: 500 });
}

/** Wrap a route handler with consistent error handling. */
export function withApi<C = unknown>(handler: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return apiError(error);
    }
  };
}

/** Parse a JSON request body with a hard size cap and Zod validation. */
export async function parseJson<T>(req: Request, schema: ZodSchema<T>, maxBytes = 64 * 1024): Promise<T> {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > maxBytes) throw new ApiError(413, "Request body too large.", "PAYLOAD_TOO_LARGE");

  let raw: string;
  try {
    raw = await req.text();
  } catch {
    throw new ApiError(400, "Invalid request body.", "BAD_REQUEST");
  }
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    throw new ApiError(413, "Request body too large.", "PAYLOAD_TOO_LARGE");
  }

  let data: unknown;
  try {
    data = JSON.parse(raw || "{}");
  } catch {
    throw new ApiError(400, "Invalid JSON body.", "BAD_JSON");
  }
  return schema.parse(data);
}

function allowedOrigins() {
  const origins = new Set<string>();
  for (const raw of [process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    if (!raw) continue;
    try {
      origins.add(new URL(raw).origin);
    } catch {
      /* ignore malformed env */
    }
  }
  origins.add("http://localhost:3000");
  origins.add("http://127.0.0.1:3000");
  return origins;
}

/**
 * CSRF protection:
 *  1. Verify Origin/Referer for browser mutations (defence in depth).
 *  2. Double-submit cookie: X-CSRF-Token must equal the non-httpOnly cookie.
 * SameSite=Lax auth cookies add a third layer.
 */
export function assertCsrf(req: Request) {
  if (process.env.NODE_ENV === "test") return;

  const origin = req.headers.get("origin");
  if (origin && !allowedOrigins().has(origin)) {
    throw new ApiError(403, "Request origin not allowed.", "CSRF_ORIGIN");
  }

  const token = req.headers.get("x-csrf-token");
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)neo_csrf=([^;]+)/);
  const cookieToken = match ? decodeURIComponent(match[1]) : null;

  if (!token || !cookieToken || token.length < 20 || cookieToken.length < 20 || token !== cookieToken) {
    throw new ApiError(403, "Security token missing or invalid. Refresh the page and try again.", "CSRF_TOKEN");
  }
}

export const noStore = { "Cache-Control": "no-store, max-age=0" };
