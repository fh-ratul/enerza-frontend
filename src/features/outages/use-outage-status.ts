"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { type ApiError, getErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/resources";
import type { ApiResult, Outage, OutageStatus } from "@/types/api";

export type OutageStatusChange = {
  id: string;
  status: Exclude<OutageStatus, "REPORTED">;
  /** Only with ASSIGNED; left out, the API picks a technician. */
  technicianId?: string;
  /** Required by the API when resolving or cancelling. */
  note?: string;
};

type Snapshot = [readonly unknown[], ApiResult<Outage[]> | undefined][];

/**
 * Moves an outage to its next status. The change shows at once in every
 * cached outage list and is rolled back if the API turns it down; either way
 * the lists are then refetched, so they end up showing what the API holds.
 */
export const useOutageStatus = (options: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation<ApiResult<Outage>, ApiError, OutageStatusChange, { previous: Snapshot }>({
    mutationFn: ({ id, ...body }) => api.patch<Outage>(`/outages/${id}/status`, body),
    onMutate: async ({ id, status }) => {
      // A refetch landing now would overwrite the optimistic rows.
      await queryClient.cancelQueries({ queryKey: queryKeys.outages });

      const previous = queryClient.getQueriesData<ApiResult<Outage[]>>({
        queryKey: queryKeys.outages,
      });

      queryClient.setQueriesData<ApiResult<Outage[]>>({ queryKey: queryKeys.outages }, (cached) =>
        cached && Array.isArray(cached.data)
          ? {
              ...cached,
              data: cached.data.map((outage) => (outage.id === id ? { ...outage, status } : outage)),
            }
          : cached,
      );

      return { previous };
    },
    onError: (error, _change, context) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        queryClient.setQueryData(queryKey, data);
      }

      toast.error(getErrorMessage(error));
    },
    onSuccess: (result) => {
      toast.success(result.message);
      options.onSuccess?.();
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.outages }),
        // A technician's active job count, and the control room's numbers.
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.adminStats }),
        queryClient.invalidateQueries({ queryKey: queryKeys.users }),
      ]),
  });
};
