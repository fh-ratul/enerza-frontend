import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function TechnicianLayout({ children }: LayoutProps<"/technician">) {
  return <DashboardShell role="TECHNICIAN">{children}</DashboardShell>;
}
