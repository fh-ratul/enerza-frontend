import type { Metadata } from "next";
import { TechnicianProfile } from "@/features/profile/technician-profile";
import { resources } from "@/lib/api/resources";
import { Prefetch } from "@/lib/query/prefetch";

export const metadata: Metadata = { title: "Profile & availability" };

export default function TechnicianProfilePage() {
  return (
    <Prefetch resources={[resources.me()]}>
      <TechnicianProfile />
    </Prefetch>
  );
}
