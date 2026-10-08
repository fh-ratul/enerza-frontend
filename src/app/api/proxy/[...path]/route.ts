import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/api/backend";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/config";
import { refreshTokens } from "@/lib/auth/refresh";
import { clearSessionCookies, setSessionCookies } from "@/lib/auth/session";
import { PUBLIC_FEEDERS_TAG } from "@/lib/api/tags";

// The browser's only way to the Enerza API. Tokens live in httpOnly cookies
// that scripts cannot read, so client components call this same-origin route
// and it adds the Authorization header on the server:
//
//   browser → /api/proxy/outages?status=REPORTED → API /outages?status=REPORTED
//
// An expired access token is renewed here once and the request retried, so a
// long-open tab keeps working without the visitor noticing.

/** API paths client components may reach. Auth and payment callbacks have their own routes. */
const ALLOWED_PREFIXES = [
  "users",
  "feeders",
  "schedules",
  "outages",
  "bills",
  "payments/initiate",
  "admin",
];

const jsonError = (statusCode: number, message: string) =>
  Response.json(
    { success: false, statusCode, message, errors: [{ path: "", message }] },
    { status: statusCode },
  );

const clientIpOf = (request: NextRequest) =>
  request.headers.get("x-real-ip") ??
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
  undefined;

/** A state-changing request must come from this site's own pages. */
const isCrossSite = (request: NextRequest) => {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  try {
    return new URL(origin).host !== request.headers.get("host");
  } catch {
    return true;
  }
};

const handle = async (request: NextRequest, context: RouteContext<"/api/proxy/[...path]">) => {
  const { path } = await context.params;
  const target = path.join("/");
  const isRead = request.method === "GET";

  if (!ALLOWED_PREFIXES.some((prefix) => target === prefix || target.startsWith(`${prefix}/`))) {
    return jsonError(404, "Not found");
  }

  if (!isRead && isCrossSite(request)) {
    return jsonError(403, "Cross-site requests are not allowed");
  }

  const store = await cookies();
  const clientIp = clientIpOf(request);
  const contentType = request.headers.get("content-type");
  // Read once into memory so the request can be replayed after a token refresh.
  const body = isRead ? undefined : await request.arrayBuffer();

  const forward = (token?: string) =>
    backendFetch(`/${target}${request.nextUrl.search}`, {
      method: request.method as "GET" | "POST" | "PATCH" | "DELETE",
      token,
      clientIp,
      body: body && body.byteLength > 0 ? body : undefined,
      headers: contentType ? { "Content-Type": contentType } : undefined,
    });

  let response: Response;

  try {
    response = await forward(store.get(ACCESS_COOKIE)?.value);

    if (response.status === 401) {
      const refreshToken = store.get(REFRESH_COOKIE)?.value;
      const renewed = refreshToken ? await refreshTokens(refreshToken, clientIp) : null;

      if (renewed) {
        await setSessionCookies(renewed);
        response = await forward(renewed.accessToken);
      } else {
        await clearSessionCookies();
      }
    }
  } catch {
    return jsonError(503, "The Enerza API could not be reached. Please try again shortly.");
  }

  // The public coverage pages cache the feeder list: refresh it after an edit.
  if (!isRead && response.ok && target.startsWith("feeders")) {
    revalidateTag(PUBLIC_FEEDERS_TAG, "max");
  }

  const headers = new Headers({
    "Content-Type": response.headers.get("content-type") ?? "application/json",
    "Cache-Control": "no-store",
  });
  const cacheStatus = response.headers.get("x-cache");

  if (cacheStatus) {
    headers.set("X-Cache", cacheStatus);
  }

  return new Response(response.body, { status: response.status, headers });
};

export { handle as DELETE, handle as GET, handle as PATCH, handle as POST };
