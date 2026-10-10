"use server";

import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/action-result";
import { backendRequest } from "@/lib/api/backend";
import { isApiError } from "@/lib/api/errors";
import { ROLE_HOME, safeRedirectTarget } from "@/lib/auth/config";
import { clearSessionCookies, getClientIp, setSessionCookies } from "@/lib/auth/session";
import { getServerEnv } from "@/lib/env";
import type { AuthTokens, Role } from "@/types/api";
import { loginSchema, registerPayloadSchema } from "./schemas";

// Logging in happens on the server: the API's tokens go straight into
// httpOnly cookies and never pass through client-side JavaScript.

const failure = (error: unknown): ActionResult => {
  if (isApiError(error)) {
    return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
  }

  return { ok: false, message: "Something went wrong. Please try again." };
};

const invalid = (issues: { path: PropertyKey[]; message: string }[]): ActionResult => ({
  ok: false,
  message: "Please check the form and try again.",
  fieldErrors: issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
});

/** Asks the API for tokens and stores them. Returns the role, or a failure. */
const authenticate = async (
  path: "/auth/login" | "/auth/register" | "/auth/google",
  json: unknown,
): Promise<{ role: Role } | ActionResult> => {
  try {
    const { data } = await backendRequest<AuthTokens>(path, {
      method: "POST",
      json,
      clientIp: await getClientIp(),
    });

    await setSessionCookies(data);

    return { role: data.user.role };
  } catch (error) {
    return failure(error);
  }
};

export async function loginAction(input: unknown, redirectTarget?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return invalid(parsed.error.issues);
  }

  const result = await authenticate("/auth/login", parsed.data);

  if (!("role" in result)) {
    return result;
  }

  // redirect() works by throwing, so it stays outside every try/catch.
  redirect(safeRedirectTarget(redirectTarget, result.role));
}

const DEMO_ROLES: readonly Role[] = ["CUSTOMER", "TECHNICIAN", "ADMIN"];

/**
 * One-click demo login. The demo credentials are read from the server's
 * environment here, so they are never part of the page sent to the browser.
 */
export async function demoLoginAction(role: Role): Promise<ActionResult> {
  if (!DEMO_ROLES.includes(role)) {
    return { ok: false, message: "Unknown demo role." };
  }

  const env = getServerEnv();
  const credentials: Record<Role, { email?: string; password?: string }> = {
    ADMIN: { email: env.DEMO_ADMIN_EMAIL, password: env.DEMO_ADMIN_PASSWORD },
    TECHNICIAN: { email: env.DEMO_TECHNICIAN_EMAIL, password: env.DEMO_TECHNICIAN_PASSWORD },
    CUSTOMER: { email: env.DEMO_CUSTOMER_EMAIL, password: env.DEMO_CUSTOMER_PASSWORD },
  };
  const { email, password } = credentials[role];

  if (!email || !password) {
    return {
      ok: false,
      message: `The ${role.toLowerCase()} demo account is not configured on this deployment.`,
    };
  }

  const result = await authenticate("/auth/login", { email, password });

  if (!("role" in result)) {
    return result;
  }

  redirect(ROLE_HOME[result.role]);
}

export async function registerAction(input: unknown): Promise<ActionResult> {
  const parsed = registerPayloadSchema.safeParse(input);

  if (!parsed.success) {
    return invalid(parsed.error.issues);
  }

  const result = await authenticate("/auth/register", parsed.data);

  if (!("role" in result)) {
    return result;
  }

  redirect(`${ROLE_HOME[result.role]}?welcome=1`);
}

/** `idToken` is the credential Google Sign-In hands to the browser. */
export async function googleLoginAction(
  idToken: string,
  redirectTarget?: string,
): Promise<ActionResult> {
  if (typeof idToken !== "string" || idToken.length < 20) {
    return { ok: false, message: "Google did not return a sign-in token. Please try again." };
  }

  const result = await authenticate("/auth/google", { idToken });

  if (!("role" in result)) {
    return result;
  }

  redirect(safeRedirectTarget(redirectTarget, result.role));
}

export async function logoutAction(): Promise<never> {
  await clearSessionCookies();
  redirect("/login");
}
