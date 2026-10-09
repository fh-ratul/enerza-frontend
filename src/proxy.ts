import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  GUEST_ONLY_ROUTES,
  REFRESH_COOKIE,
  ROLE_HOME,
  sectionFor,
} from "@/lib/auth/config";
import { refreshTokens } from "@/lib/auth/refresh";
import { readAccessToken, secondsUntilExpiry, sessionCookieOptions } from "@/lib/auth/tokens";

// Next.js 16 calls this file "proxy" (it was "middleware" before). It runs
// before a request reaches a protected section and decides, from the session
// cookie alone, whether to let it through:
//
//   no session            → /login?redirect=<where they were going>
//   wrong role            → that role's own home
//   expired access token  → renewed with the refresh token, transparently
//   logged in on /login   → their home
//
// It is an optimistic check that keeps people out of screens that are not
// theirs. The API still authorises every request for data.

const ONE_DAY = 24 * 60 * 60;

const clientIpOf = (request: NextRequest) =>
  request.headers.get("x-real-ip") ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  undefined;

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const section = sectionFor(pathname);
  const isGuestOnly = GUEST_ONLY_ROUTES.includes(pathname);

  let session = await readAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);
  let renewed: Awaited<ReturnType<typeof refreshTokens>> = null;

  if (!session) {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

    if (refreshToken) {
      renewed = await refreshTokens(refreshToken, clientIpOf(request));
      session = renewed ? await readAccessToken(renewed.accessToken) : null;
    }
  }

  // Whatever the outcome, a renewed pair of tokens is handed to the browser.
  const withRenewedCookies = (response: NextResponse) => {
    if (renewed && session) {
      response.cookies.set(
        ACCESS_COOKIE,
        renewed.accessToken,
        sessionCookieOptions(secondsUntilExpiry(renewed.accessToken, ONE_DAY)),
      );
      response.cookies.set(
        REFRESH_COOKIE,
        renewed.refreshToken,
        sessionCookieOptions(secondsUntilExpiry(renewed.refreshToken, 7 * ONE_DAY)),
      );
    }

    return response;
  };

  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (isGuestOnly) {
    return session ? withRenewedCookies(redirectTo(ROLE_HOME[session.role])) : NextResponse.next();
  }

  if (!section) {
    return NextResponse.next();
  }

  if (!session) {
    const response = redirectTo(`/login?redirect=${encodeURIComponent(pathname + search)}`);

    // Cookies that no longer work would only trigger another failed refresh.
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);

    return response;
  }

  if (session.role !== section.role) {
    return withRenewedCookies(redirectTo(ROLE_HOME[session.role]));
  }

  if (renewed) {
    // The page that renders next must already see the new tokens.
    request.cookies.set(ACCESS_COOKIE, renewed.accessToken);
    request.cookies.set(REFRESH_COOKIE, renewed.refreshToken);

    return withRenewedCookies(NextResponse.next({ request: { headers: request.headers } }));
  }

  return NextResponse.next();
}

// Only the protected sections and the guest-only pages: public pages never
// pass through here, so they stay fully static.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/technician/:path*",
    "/admin/:path*",
    "/payment/:path*",
    "/login",
    "/register",
  ],
};
