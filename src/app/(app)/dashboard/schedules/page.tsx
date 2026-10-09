import type { Metadata } from "next";
import { customerQueries } from "@/features/customer/queries";
import { ScheduleList } from "@/features/customer/schedule-list";
import { resources } from "@/lib/api/resources";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Schedule" };

export default function CustomerSchedulesPage() {
  return (
    <Prefetch resources={[resources.me(), customerQueries.schedules]}>
      <ScheduleList />
    </Prefetch>
  );
}
