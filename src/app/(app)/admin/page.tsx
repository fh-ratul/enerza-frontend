import type { Metadata } from "next";
import { AdminOverview } from "@/features/admin/admin-overview";
import { adminQueries } from "@/features/admin/queries";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  return (
    <Prefetch resources={[adminQueries.stats, adminQueries.recentOutages, adminQueries.recentBills, adminQueries.latestAudit]}>
      <AdminOverview />
    </Prefetch>
  );
}
