import type { Metadata } from "next";
import { adminQueries, adminScheduleList } from "@/features/admin/queries";
import { ScheduleTable } from "@/features/schedules/schedule-table";
import { fromSearchParams } from "@/lib/list-params";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Schedules" };

export default async function AdminSchedulesPage({ searchParams }: PageProps<"/admin/schedules">) {
  const raw = fromSearchParams(await searchParams);

  return (
    <Prefetch resources={[adminScheduleList(raw), adminQueries.grid]}>
      <ScheduleTable />
    </Prefetch>
  );
}
