import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = {
  // Signed-in pages have no business in a search index.
  robots: { index: false, follow: false },
};

export default function TechnicianLayout({ children }: LayoutProps<"/technician">) {
  return <DashboardShell role="TECHNICIAN">{children}</DashboardShell>;
}
