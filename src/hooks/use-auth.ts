"use client";

import { useResource } from "@/hooks/use-resource";
import { resources } from "@/lib/api/resources";

/**
 * The logged-in user's profile. The dashboard layout prefetches it on the
 * server, so inside a dashboard it is available on the first render; any
 * component that changes the profile only has to invalidate ["me"].
 */
export const useAuth = () => {
  const query = useResource(resources.me(), { staleTime: 5 * 60 * 1000 });
  const user = query.data?.data;

  return {
    user,
    role: user?.role,
    isLoading: query.isPending,
    isCustomer: user?.role === "CUSTOMER",
    isTechnician: user?.role === "TECHNICIAN",
    isAdmin: user?.role === "ADMIN",
  };
};
