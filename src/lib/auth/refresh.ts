import type { AuthTokens } from "@/types/api";

// Called from the proxy and from Route Handlers, so it uses plain fetch and
// the environment directly instead of the server-only API client.

type RefreshedTokens = Pick<AuthTokens, "accessToken" | "refreshToken">;

/**
 * Exchanges a refresh token for a new pair. Null means the refresh token is
 * no longer accepted (or the API is unreachable) and the visitor has to log
 * in again.
 */
export const refreshTokens = async (
  refreshToken: string,
  clientIp?: string,
): Promise<RefreshedTokens | null> => {
  const apiUrl = process.env.API_URL?.replace(/\/+$/, "");
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!apiUrl) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(internalKey && clientIp
          ? { "X-Internal-Key": internalKey, "X-Client-IP": clientIp }
          : {}),
      },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: Partial<RefreshedTokens> };
    const { accessToken, refreshToken: nextRefreshToken } = payload.data ?? {};

    return accessToken && nextRefreshToken
      ? { accessToken, refreshToken: nextRefreshToken }
      : null;
  } catch {
    return null;
  }
};
