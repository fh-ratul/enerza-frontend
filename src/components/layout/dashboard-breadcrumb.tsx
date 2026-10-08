"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROLE_HOME } from "@/lib/auth/config";
import { findActiveNavItem, ROLE_SECTION_LABEL } from "@/lib/navigation";
import type { Role } from "@/types/api";

/** "Control room / Feeders": where the visitor is, from the navigation itself. */
export function DashboardBreadcrumb({ role }: { role: Role }) {
  const pathname = usePathname();
  const active = findActiveNavItem(role, pathname);
  const isHome = pathname === ROLE_HOME[role];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:block">
          {isHome ? (
            <BreadcrumbPage>{ROLE_SECTION_LABEL[role]}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={ROLE_HOME[role]}>{ROLE_SECTION_LABEL[role]}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {active && !isHome ? (
          <>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{active.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
