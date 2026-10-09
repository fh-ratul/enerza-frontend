import type { Metadata } from "next";
import { toAreaOptions } from "@/features/grid/area-options";
import { getGridSnapshot } from "@/features/grid/public-data";
import { CustomerProfile } from "@/features/profile/customer-profile";
import { resources } from "@/lib/api/resources";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Profile" };

export default async function CustomerProfilePage() {
  // The area list is public and cached; the profile itself comes with the session.
  const grid = await getGridSnapshot();

  return (
    <Prefetch resources={[resources.me()]}>
      <CustomerProfile areas={toAreaOptions(grid?.feeders ?? [])} />
    </Prefetch>
  );
}
