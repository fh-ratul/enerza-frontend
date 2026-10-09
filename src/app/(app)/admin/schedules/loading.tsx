import { TablePageSkeleton } from "@/components/shared/page-skeletons";

export default function Loading() {
  return <TablePageSkeleton search={false} filters={5} />;
}
