import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { AuthTokens, Role } from "@/types/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, ROLE_HOME } from "./config";
import { readAccessToken, secondsUntilExpiry, sessionCookieOptions, type Session } from "./tokens";

const ONE_DAY = 24 * 60 * 60;

/** The access token of the current request, if there is one. */
export const getAccessToken = async (): Promise<string | undefined> =>
  (await cookies()).get(ACCESS_COOKIE)?.value;

/**
 * Who is making this request. Memoised per request, so a layout, a page and
 * the components under them can all ask without reading the cookie again.
 */
export const getSession = cache(
  async (): Promise<Session | null> => readAccessToken(await getAccessToken()),
);

/**
 * For pages inside a protected section. The proxy has already checked the
 * role before the page renders; this is the same check next to the data, so
 * a page stays protected even if it is ever reached another way.
 */
export const requireSession = async (role?: Role): Promise<Session> => {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (role && session.role !== role) {
    redirect(ROLE_HOME[session.role]);
  }

  return session;
};

/** Only callable where cookies can be written: Server Actions and Route Handlers. */
export const setSessionCookies = async ({
  accessToken,
  refreshToken,
}: Pick<AuthTokens, "accessToken" | "refreshToken">) => {
  const store = await cookies();

  store.set(
    ACCESS_COOKIE,
    accessToken,
    sessionCookieOptions(secondsUntilExpiry(accessToken, ONE_DAY)),
  );
  store.set(
    REFRESH_COOKIE,
    refreshToken,
    sessionCookieOptions(secondsUntilExpiry(refreshToken, 7 * ONE_DAY)),
  );
};

export const clearSessionCookies = async () => {
  const store = await cookies();

  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
};

/**
 * The visitor's address as the hosting platform reports it, passed on to the
 * API so its rate limits and audit log are per visitor.
 */
export const getClientIp = async (): Promise<string | undefined> => {
  const requestHeaders = await headers();

  return (
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined
  );
};
