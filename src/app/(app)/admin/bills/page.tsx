import type { Metadata } from "next";
import { adminBillList } from "@/features/admin/queries";
import { AdminBillTable } from "@/features/bills/admin-bill-table";
import { fromSearchParams } from "@/lib/list-params";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Bills" };

export default async function AdminBillsPage({ searchParams }: PageProps<"/admin/bills">) {
  const raw = fromSearchParams(await searchParams);

  return (
    <Prefetch resources={[adminBillList(raw)]}>
      <AdminBillTable />
    </Prefetch>
  );
}
