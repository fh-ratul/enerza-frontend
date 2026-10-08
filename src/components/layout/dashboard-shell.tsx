import { type ReactNode, Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { resources } from "@/lib/api/resources";
import { Prefetch } from "@/lib/query/prefetch";
import type { Role } from "@/types/api";
import { AppSidebar } from "./app-sidebar";
import { DashboardBreadcrumb } from "./dashboard-breadcrumb";
import { NavUser, NavUserSkeleton } from "./nav-user";
import { ShallowUrlState } from "./shallow-url-state";

type DashboardShellProps = {
  role: Role;
  children: ReactNode;
};

/**
 * The frame every dashboard page sits in. Which menu to show follows from the
 * URL section, so the whole frame is static and appears at once; only the
 * account menu needs the visitor's session, and it streams in behind its own
 * Suspense boundary (with the profile already in the query cache when it lands).
 */
export function DashboardShell({ role, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        role={role}
        footer={
          <Suspense fallback={<NavUserSkeleton />}>
            <Prefetch resources={[resources.me()]}>
              <NavUser />
            </Prefetch>
          </Suspense>
        }
      />
      <SidebarInset className="min-w-0">
        <header className="bg-background/85 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-xl sm:px-6">
          <SidebarTrigger className="-ml-1.5" />
          <Separator orientation="vertical" className="mr-1.5 h-4!" />
          <DashboardBreadcrumb role={role} />
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main id="main" className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <ShallowUrlState>{children}</ShallowUrlState>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
