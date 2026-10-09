import type { Metadata } from "next";
import { adminAuditLogList } from "@/features/admin/queries";
import { AuditLogTable } from "@/features/audit/audit-log-table";
import { fromSearchParams } from "@/lib/list-params";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Audit log" };

export default async function AdminAuditLogPage({ searchParams }: PageProps<"/admin/audit-logs">) {
  const raw = fromSearchParams(await searchParams);

  return (
    <Prefetch resources={[adminAuditLogList(raw)]}>
      <AuditLogTable />
    </Prefetch>
  );
}
