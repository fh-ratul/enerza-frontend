import "server-only";
import { redirect } from "next/navigation";
import { getAccessToken, getClientIp } from "@/lib/auth/session";
import type { ApiResult } from "@/types/api";
import { backendRequest } from "./backend";
import { isApiError } from "./errors";
import type { QueryParams } from "./query-string";

/**
 * Reads from the API on behalf of the logged-in visitor, for Server
 * Components. The token comes straight from the request's cookie.
 */
const get = async <T>(path: string, query?: QueryParams): Promise<ApiResult<T>> => {
  const [token, clientIp] = await Promise.all([getAccessToken(), getClientIp()]);

  try {
    return await backendRequest<T>(path, { query, token, clientIp });
  } catch (error) {
    // The proxy renews tokens before a page renders, so a 401 here means the
    // session really is over (e.g. the account was blocked meanwhile).
    if (isApiError(error) && error.statusCode === 401) {
      redirect("/login?expired=1");
    }

    throw error;
  }
};

export const serverApi = { get };
