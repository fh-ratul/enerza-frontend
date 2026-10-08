import type { Metadata } from "next";
import { CustomerOverview } from "@/features/customer/customer-overview";
import { customerQueries } from "@/features/customer/queries";
import { resources } from "@/lib/api/resources";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Overview" };

/**
 * A Server Component: it fetches everything the overview needs with the
 * visitor's cookie and hands it to the client components below, which take
 * over from there (refetching, reacting to mutations) without a first request
 * of their own. While this runs, loading.tsx shows the page's skeleton.
 */
export default function CustomerOverviewPage() {
  return (
    <Prefetch
      resources={[
        resources.me(),
        customerQueries.schedules,
        customerQueries.recentOutages,
        customerQueries.billHistory,
      ]}
    >
      <CustomerOverview />
    </Prefetch>
  );
}
