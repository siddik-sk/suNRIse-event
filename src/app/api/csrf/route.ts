import { cookies } from "next/headers";
import { json } from "@/lib/api";
import { CSRF_COOKIE, randomToken } from "@/lib/auth/tokens";

export const dynamic = "force-dynamic";

/** Issues (or returns) the non-httpOnly CSRF double-submit token. */
export async function GET() {
  const jar = await cookies();
  const existing = jar.get(CSRF_COOKIE)?.value;
  if (existing) return json({ token: existing });

  const token = randomToken(24);
  jar.set(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return json({ token });
}
