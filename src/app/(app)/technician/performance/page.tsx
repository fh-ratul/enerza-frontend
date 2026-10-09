import type { Metadata } from "next";
import { Performance } from "@/features/technician/performance";
import { technicianQueries } from "@/features/technician/queries";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Performance" };

export default function TechnicianPerformancePage() {
  return (
    <Prefetch resources={[technicianQueries.history]}>
      <Performance />
    </Prefetch>
  );
}
