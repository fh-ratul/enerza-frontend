import type { Role } from "@/types/api";

// Shared by the proxy, server code and client code: no server-only imports here.

export const ACCESS_COOKIE = "enerza_access";
export const REFRESH_COOKIE = "enerza_refresh";

/** Where each role lands after logging in, and the only section it may open. */
export const ROLE_HOME: Record<Role, string> = {
  CUSTOMER: "/dashboard",
  TECHNICIAN: "/technician",
  ADMIN: "/admin",
};

export const PROTECTED_SECTIONS: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard", role: "CUSTOMER" },
  { prefix: "/technician", role: "TECHNICIAN" },
  { prefix: "/admin", role: "ADMIN" },
];

/** Pages a logged-in user has no use for. */
export const GUEST_ONLY_ROUTES = ["/login", "/register"];

export const sectionFor = (pathname: string) =>
  PROTECTED_SECTIONS.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

/**
 * A `?redirect=` target is only honoured when it is a path inside the section
 * the role may open, so a crafted link can neither send someone off-site nor
 * bounce them into a section that would immediately reject them.
 */
export const safeRedirectTarget = (target: string | null | undefined, role: Role): string => {
  const home = ROLE_HOME[role];

  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return home;
  }

  const pathname = target.split(/[?#]/)[0];

  return sectionFor(pathname)?.role === role ? target : home;
};
