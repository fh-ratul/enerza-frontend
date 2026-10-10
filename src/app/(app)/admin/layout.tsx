import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <DashboardShell role="ADMIN">{children}</DashboardShell>;
}
