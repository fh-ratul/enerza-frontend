import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function CustomerLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell role="CUSTOMER">{children}</DashboardShell>;
}
