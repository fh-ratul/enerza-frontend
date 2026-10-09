import type { Metadata } from "next";
import { OutageList } from "@/features/customer/outage-list";
import { customerOutageList } from "@/features/customer/queries";
import { resources } from "@/lib/api/resources";
import { fromSearchParams } from "@/lib/list-params";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Outages" };

export default async function CustomerOutagesPage({
  searchParams,
}: PageProps<"/dashboard/outages">) {
  // The same filters the list reads from the URL in the browser, so the first
  // page of results is already in its cache when it renders.
  const raw = fromSearchParams(await searchParams);

  return (
    <Prefetch resources={[resources.me(), customerOutageList(raw)]}>
      <OutageList />
    </Prefetch>
  );
}
