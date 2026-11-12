"use client";

/** Small typed fetch wrapper with CSRF, timeout, single-flight refresh and retry. */

export class ApiClientError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  json?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
  retry?: boolean;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrf(): Promise<string> {
  let token = readCookie("neo_csrf");
  if (!token) {
    await fetch("/api/csrf", { cache: "no-store", credentials: "same-origin" });
    token = readCookie("neo_csrf");
  }
  return token ?? "";
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const payload = (data ?? {}) as {
      error?: string;
      code?: string;
      fieldErrors?: Record<string, string>;
    };
    throw new ApiClientError(
      payload.error || "Something went wrong. Please try again.",
      res.status,
      payload.code,
      payload.fieldErrors,
    );
  }
  return data as T;
}

let refreshInFlight: Promise<boolean> | null = null;

/** Rotate the refresh token. Safe to call from multiple components at once. */
export function refreshSession(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const csrf = await ensureCsrf();
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
        headers: csrf ? { "x-csrf-token": csrf } : undefined,
        cache: "no-store",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      // Allow another refresh after the in-flight request settles.
      setTimeout(() => {
        refreshInFlight = null;
      }, 250);
    }
  })();

  return refreshInFlight;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}, isRetry = false): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options.formData) {
    body = options.formData;
  } else if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  if (method !== "GET") {
    const csrf = await ensureCsrf();
    if (csrf) headers["x-csrf-token"] = csrf;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  const signal = options.signal ?? controller.signal;

  let res: Response;
  try {
    res = await fetch(path, {
      method,
      headers,
      body,
      credentials: "same-origin",
      cache: "no-store",
      signal,
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError("The request timed out. Check your connection and retry.", 408, "TIMEOUT");
    }
    throw new ApiClientError("Network error. Check your connection and retry.", 0, "NETWORK");
  } finally {
    clearTimeout(timeout);
  }

  // Access token expired → rotate refresh token once, then replay the request.
  if (res.status === 401 && options.retry !== false && !isRetry && !path.includes("/api/auth/")) {
    const refreshed = await refreshSession();
    if (refreshed) return apiFetch<T>(path, { ...options, retry: false }, true);
  }

  return parseResponse<T>(res);
}

export function fieldErrorsFrom(error: unknown): Record<string, string> {
  if (error instanceof ApiClientError && error.fieldErrors) return error.fieldErrors;
  return {};
}
