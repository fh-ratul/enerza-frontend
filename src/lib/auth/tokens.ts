import { decodeJwt, jwtVerify } from "jose";
import type { Role } from "@/types/api";

// Used by the proxy as well as by server components, so it reads the
// environment directly and imports nothing that only works in one of them.

export type Session = {
  userId: string;
  email: string;
  role: Role;
  /** When the access token stops being valid, in seconds since the epoch. */
  expiresAt: number;
};

const ROLES: readonly string[] = ["CUSTOMER", "TECHNICIAN", "ADMIN"];

const toSession = (payload: Record<string, unknown>): Session | null => {
  const { userId, email, role, exp } = payload;

  if (
    typeof userId !== "string" ||
    typeof email !== "string" ||
    typeof role !== "string" ||
    !ROLES.includes(role) ||
    typeof exp !== "number"
  ) {
    return null;
  }

  return { userId, email, role: role as Role, expiresAt: exp };
};

/**
 * Reads an access token into a session, or null when it is missing, malformed
 * or expired.
 *
 * With JWT_ACCESS_SECRET set, the signature is verified, so a forged cookie
 * never gets past the proxy. Without it the token is only decoded: that is
 * still safe, because every piece of data comes from the API, which verifies
 * the token itself. A forged cookie would then open an empty shell at most.
 */
export const readAccessToken = async (token: string | undefined): Promise<Session | null> => {
  if (!token) {
    return null;
  }

  const secret = process.env.JWT_ACCESS_SECRET;

  try {
    if (secret) {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
        algorithms: ["HS256"],
      });

      return toSession(payload);
    }

    const payload = decodeJwt(token);

    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return toSession(payload);
  } catch {
    return null;
  }
};

/** Seconds until a token expires, for the lifetime of the cookie that holds it. */
export const secondsUntilExpiry = (token: string, fallbackSeconds: number): number => {
  try {
    const { exp } = decodeJwt(token);

    if (typeof exp === "number") {
      return Math.max(0, exp - Math.floor(Date.now() / 1000));
    }
  } catch {
    // not a JWT: use the fallback
  }

  return fallbackSeconds;
};

export const sessionCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});
