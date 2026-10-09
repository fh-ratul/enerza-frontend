import { TablePageSkeleton } from "@/components/shared/page-skeletons";

export default function Loading() {
  return <TablePageSkeleton stats={3} search={false} filters={1} />;
}
