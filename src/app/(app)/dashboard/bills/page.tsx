import type { Metadata } from "next";
import { BillList } from "@/features/customer/bill-list";
import { customerBillList, customerQueries } from "@/features/customer/queries";
import { fromSearchParams } from "@/lib/list-params";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Bills" };

export default async function CustomerBillsPage({ searchParams }: PageProps<"/dashboard/bills">) {
  const raw = fromSearchParams(await searchParams);

  return (
    <Prefetch resources={[customerBillList(raw), customerQueries.billHistory]}>
      <BillList />
    </Prefetch>
  );
}
