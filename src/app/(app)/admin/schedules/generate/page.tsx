import type { Metadata } from "next";
import { adminQueries } from "@/features/admin/queries";
import { GenerateWizard } from "@/features/schedules/generate-wizard";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Generate rotation" };

export default function GenerateRotationPage() {
  return (
    <Prefetch resources={[adminQueries.grid]}>
      <GenerateWizard />
    </Prefetch>
  );
}
