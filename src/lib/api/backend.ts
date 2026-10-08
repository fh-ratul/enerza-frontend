import "server-only";
import { getServerEnv } from "@/lib/env";
import type { ApiFailure, ApiResult, ApiSuccess } from "@/types/api";
import { ApiError } from "./errors";
import { type QueryParams, toQueryString } from "./query-string";

type BackendRequest = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: QueryParams;
  /** A plain value is sent as JSON; anything else (FormData, a stream) is passed through. */
  json?: unknown;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  /** The visitor's access token, sent as a Bearer token. */
  token?: string;
  /** The visitor's address, so the API rate-limits and audits them and not this server. */
  clientIp?: string;
  signal?: AbortSignal;
};

/**
 * The one place this app talks to the Enerza API. Only server code can import
 * it: the browser goes through /api/proxy, so tokens stay in httpOnly cookies.
 */
export const backendFetch = (path: string, request: BackendRequest = {}): Promise<Response> => {
  const { API_URL, INTERNAL_API_KEY } = getServerEnv();
  const headers = new Headers(request.headers);

  headers.set("Accept", "application/json");

  if (request.token) {
    headers.set("Authorization", `Bearer ${request.token}`);
  }

  if (INTERNAL_API_KEY && request.clientIp) {
    headers.set("X-Internal-Key", INTERNAL_API_KEY);
    headers.set("X-Client-IP", request.clientIp);
  }

  let body = request.body;

  if (request.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(request.json);
  }

  return fetch(`${API_URL}${path}${toQueryString(request.query)}`, {
    method: request.method ?? "GET",
    headers,
    body,
    signal: request.signal,
  });
};

/** Reads the API's envelope: the payload on success, an ApiError otherwise. */
export const readEnvelope = async <T>(response: Response): Promise<ApiResult<T>> => {
  let payload: ApiSuccess<T> | ApiFailure | null = null;

  try {
    payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    // not JSON: handled below
  }

  if (!payload || typeof payload !== "object" || !("success" in payload)) {
    throw new ApiError(
      response.ok ? 502 : response.status,
      "The Enerza API returned an unexpected response.",
    );
  }

  if (!payload.success) {
    throw new ApiError(payload.statusCode ?? response.status, payload.message, payload.errors);
  }

  return { data: payload.data, meta: payload.meta, message: payload.message };
};

/** fetch + envelope, with a network failure reported as a 503. */
export const backendRequest = async <T>(
  path: string,
  request: BackendRequest = {},
): Promise<ApiResult<T>> => {
  let response: Response;

  try {
    response = await backendFetch(path, request);
  } catch {
    throw new ApiError(503, "The Enerza API could not be reached. Please try again shortly.");
  }

  return readEnvelope<T>(response);
};
