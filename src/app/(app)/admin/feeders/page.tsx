import type { Metadata } from "next";
import { adminFeederList, adminQueries } from "@/features/admin/queries";
import { FeederTable } from "@/features/feeders/feeder-table";
import { fromSearchParams } from "@/lib/list-params";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Feeders" };

export default async function AdminFeedersPage({ searchParams }: PageProps<"/admin/feeders">) {
  const raw = fromSearchParams(await searchParams);

  return (
    <Prefetch resources={[adminFeederList(raw), adminQueries.grid]}>
      <FeederTable />
    </Prefetch>
  );
}
