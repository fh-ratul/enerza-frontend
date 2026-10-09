import type { Metadata } from "next";
import { adminQueries, adminUserList } from "@/features/admin/queries";
import { UserTable } from "@/features/users/user-table";
import { resources } from "@/lib/api/resources";
import { fromSearchParams } from "@/lib/list-params";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const raw = fromSearchParams(await searchParams);

  return (
    <Prefetch resources={[resources.me(), adminUserList(raw), adminQueries.grid]}>
      <UserTable />
    </Prefetch>
  );
}
