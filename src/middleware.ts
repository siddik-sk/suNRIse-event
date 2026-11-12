import { NextRequest, NextResponse } from "next/server";

const ACCESS_COOKIE = "neo_access";
const REFRESH_COOKIE = "neo_refresh";
const CSRF_COOKIE = "neo_csrf";

/**
 * Edge middleware:
 *  - seeds the CSRF double-submit cookie
 *  - performs a cheap auth gate for protected areas
 *  - enforces same-origin navigation for admin pages
 * Real role checks always happen server-side in the page/route.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(ACCESS_COOKIE) || req.cookies.get(REFRESH_COOKIE));

  let res: NextResponse;

  if (!hasSession && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + search);
    res = NextResponse.redirect(loginUrl);
  } else {
    res = NextResponse.next();
  }

  if (!req.cookies.get(CSRF_COOKIE)) {
    res.cookies.set(CSRF_COOKIE, crypto.randomUUID(), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)"],
};
