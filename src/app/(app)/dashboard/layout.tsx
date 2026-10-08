import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata: Metadata = {
  // Signed-in pages have no business in a search index.
  robots: { index: false, follow: false },
};

export default function CustomerLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell role="CUSTOMER">{children}</DashboardShell>;
}
