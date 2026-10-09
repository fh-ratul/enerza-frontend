import type { Metadata } from "next";
import { JobBoard } from "@/features/technician/job-board";
import { technicianJobList, technicianQueries } from "@/features/technician/queries";
import { resources } from "@/lib/api/resources";
import { fromSearchParams } from "@/lib/list-params";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "My jobs" };

export default async function TechnicianJobsPage({ searchParams }: PageProps<"/technician">) {
  const raw = fromSearchParams(await searchParams);

  return (
    <Prefetch resources={[resources.me(), technicianJobList(raw), technicianQueries.history]}>
      <JobBoard />
    </Prefetch>
  );
}
