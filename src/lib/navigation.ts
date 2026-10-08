import {
  CalendarClock,
  ChartColumn,
  CreditCard,
  FileClock,
  LayoutDashboard,
  type LucideIcon,
  Receipt,
  Siren,
  Sparkles,
  UserCog,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import type { Role } from "@/types/api";

export type NavItem = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

/** What each role's sidebar offers. A role never sees another role's entries. */
export const NAVIGATION: Record<Role, NavGroup[]> = {
  CUSTOMER: [
    {
      label: "My power",
      items: [
        { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { title: "Schedule", href: "/dashboard/schedules", icon: CalendarClock },
        { title: "Outages", href: "/dashboard/outages", icon: Siren },
      ],
    },
    {
      label: "Billing",
      items: [
        { title: "Bills", href: "/dashboard/bills", icon: Receipt },
        { title: "Payments", href: "/dashboard/payments", icon: CreditCard },
      ],
    },
    {
      label: "Account",
      items: [{ title: "Profile", href: "/dashboard/profile", icon: UserCog }],
    },
  ],
  TECHNICIAN: [
    {
      label: "Field work",
      items: [
        { title: "My jobs", href: "/technician", icon: Wrench },
        { title: "Performance", href: "/technician/performance", icon: ChartColumn },
      ],
    },
    {
      label: "Account",
      items: [{ title: "Profile & availability", href: "/technician/profile", icon: UserCog }],
    },
  ],
  ADMIN: [
    {
      label: "Control room",
      items: [
        { title: "Overview", href: "/admin", icon: LayoutDashboard },
        { title: "Outages", href: "/admin/outages", icon: Siren },
        { title: "Schedules", href: "/admin/schedules", icon: CalendarClock },
        { title: "Generate rotation", href: "/admin/schedules/generate", icon: Sparkles },
      ],
    },
    {
      label: "Grid",
      items: [{ title: "Feeders", href: "/admin/feeders", icon: Zap }],
    },
    {
      label: "Customers",
      items: [
        { title: "Bills", href: "/admin/bills", icon: Receipt },
        { title: "Users", href: "/admin/users", icon: Users },
      ],
    },
    {
      label: "Compliance",
      items: [{ title: "Audit log", href: "/admin/audit-logs", icon: FileClock }],
    },
  ],
};

export const ROLE_SECTION_LABEL: Record<Role, string> = {
  CUSTOMER: "Customer portal",
  TECHNICIAN: "Field crew",
  ADMIN: "Control room",
};

export const PROFILE_PATH: Record<Role, string | null> = {
  CUSTOMER: "/dashboard/profile",
  TECHNICIAN: "/technician/profile",
  ADMIN: null,
};

/**
 * The entry for the current URL: the one with the longest matching path, so
 * /admin/schedules/generate lights up "Generate rotation" and not "Schedules".
 */
export const findActiveNavItem = (role: Role, pathname: string): NavItem | undefined =>
  NAVIGATION[role]
    .flatMap((group) => group.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
