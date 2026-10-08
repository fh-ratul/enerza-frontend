"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { ROLE_HOME } from "@/lib/auth/config";
import { findActiveNavItem, NAVIGATION, ROLE_SECTION_LABEL } from "@/lib/navigation";
import type { Role } from "@/types/api";

type AppSidebarProps = {
  /** Known from the URL section (/admin, /technician, /dashboard), so the menu is static. */
  role: Role;
  /** The account menu, streamed in by the layout. */
  footer: ReactNode;
};

/** The dashboard's navigation: this role's menu, collapsible to icons, a sheet on phones. */
export function AppSidebar({ role, footer }: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const activeItem = findActiveNavItem(role, pathname);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROLE_HOME[role]} onClick={() => setOpenMobile(false)}>
                <LogoMark />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="font-heading text-base font-bold tracking-tight">Enerza</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {ROLE_SECTION_LABEL[role]}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAVIGATION[role].map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = item === activeItem;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link
                          href={item.href}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setOpenMobile(false)}
                        >
                          <item.icon aria-hidden />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>{footer}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
