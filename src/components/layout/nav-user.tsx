"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronsUpDown, Globe, LogOut, UserCog } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { logoutAction } from "@/features/auth/actions";
import { useAuth } from "@/hooks/use-auth";
import { PROFILE_PATH } from "@/lib/navigation";
import { ROLE } from "@/lib/status";

export function NavUserSkeleton() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Skeleton className="size-8 rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

/** The signed-in user at the foot of the sidebar, with the account menu. */
export function NavUser() {
  const { user } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const queryClient = useQueryClient();
  const [isLoggingOut, startTransition] = useTransition();

  if (!user) {
    return <NavUserSkeleton />;
  }

  const profilePath = PROFILE_PATH[user.role];

  const logout = () => {
    startTransition(async () => {
      // Nothing of this account may be left in memory for the next one.
      queryClient.clear();
      await logoutAction();
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent"
              aria-label={`Account menu for ${user.name}`}
            >
              <UserAvatar name={user.name} photo={user.profilePhoto} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto" aria-hidden />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="flex items-center gap-3 p-2 font-normal">
              <UserAvatar name={user.name} photo={user.profilePhoto} size={36} />
              <div className="grid flex-1 gap-0.5 leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              </div>
              <StatusBadge tone={ROLE[user.role].tone}>{ROLE[user.role].label}</StatusBadge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {profilePath ? (
                <DropdownMenuItem asChild>
                  <Link href={profilePath} onClick={() => setOpenMobile(false)}>
                    <UserCog aria-hidden />
                    Profile and settings
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem asChild>
                <Link href="/">
                  <Globe aria-hidden />
                  Back to the website
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onSelect={(event) => {
                // Keep the menu open so the spinner is visible until the redirect.
                event.preventDefault();
                logout();
              }}
            >
              {isLoggingOut ? <Spinner /> : <LogOut aria-hidden />}
              {isLoggingOut ? "Logging out…" : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
