import type { ApiFailure, ApiResult, ApiSuccess } from "@/types/api";
import { ApiError } from "./errors";
import { type QueryParams, toQueryString } from "./query-string";

// The browser-side API client. Every call goes to this app's own /api/proxy
// route, which adds the visitor's token on the server (see that route).

const PROXY_BASE = "/api/proxy";

type RequestOptions = {
  query?: QueryParams;
  signal?: AbortSignal;
};

let isLeaving = false;

/** The session is gone for good: send the visitor to log in, once. */
const handleExpiredSession = () => {
  if (isLeaving || typeof window === "undefined") {
    return;
  }

  isLeaving = true;

  const here = window.location.pathname + window.location.search;

  window.location.assign(`/login?expired=1&redirect=${encodeURIComponent(here)}`);
};

const toResult = <T>(status: number, payload: unknown): ApiResult<T> => {
  const envelope = payload as ApiSuccess<T> | ApiFailure | null;

  if (!envelope || typeof envelope !== "object" || !("success" in envelope)) {
    throw new ApiError(status >= 400 ? status : 502, "The server returned an unexpected response.");
  }

  if (!envelope.success) {
    if (envelope.statusCode === 401) {
      handleExpiredSession();
    }

    throw new ApiError(envelope.statusCode ?? status, envelope.message, envelope.errors);
  }

  return { data: envelope.data, meta: envelope.meta, message: envelope.message };
};

const request = async <T>(
  method: string,
  path: string,
  { query, signal }: RequestOptions = {},
  body?: unknown,
): Promise<ApiResult<T>> => {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${PROXY_BASE}${path}${toQueryString(query)}`, {
    method,
    signal,
    credentials: "same-origin",
    headers: body !== undefined && !isFormData ? { "Content-Type": "application/json" } : undefined,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  return toResult<T>(response.status, await response.json().catch(() => null));
};

type UploadOptions = {
  method?: "POST" | "PATCH";
  /** Called with 0–100 as the file leaves the browser. */
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

/**
 * multipart/form-data with upload progress. fetch() cannot report how much of
 * a request body has been sent, so this one call uses XMLHttpRequest.
 */
const upload = <T>(
  path: string,
  formData: FormData,
  { method = "POST", onProgress, signal }: UploadOptions = {},
): Promise<ApiResult<T>> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, `${PROXY_BASE}${path}`);
    xhr.responseType = "text";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let payload: unknown = null;

      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // handled by toResult
      }

      try {
        resolve(toResult<T>(xhr.status, payload));
      } catch (error) {
        reject(error);
      }
    };

    xhr.onerror = () => reject(new TypeError("Network request failed"));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });

    xhr.send(formData);
  });

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, options, body ?? {}),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, options, body ?? {}),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
  upload,
};
