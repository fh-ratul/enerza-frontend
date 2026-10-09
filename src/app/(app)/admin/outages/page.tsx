import type { Metadata } from "next";
import { adminOutageList, adminQueries } from "@/features/admin/queries";
import { OutageBoard } from "@/features/outages/outage-board";
import { fromSearchParams } from "@/lib/list-params";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Outages" };

export default async function AdminOutagesPage({ searchParams }: PageProps<"/admin/outages">) {
  const raw = fromSearchParams(await searchParams);

  return (
    <Prefetch resources={[adminOutageList(raw), adminQueries.grid]}>
      <OutageBoard />
    </Prefetch>
  );
}
