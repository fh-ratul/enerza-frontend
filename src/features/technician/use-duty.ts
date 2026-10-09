"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { type ApiError, getErrorMessage } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/resources";
import type { ApiResult, Me } from "@/types/api";

/**
 * Puts the technician on or off duty. The switch moves at once and snaps
 * back if the API refuses.
 */
export const useDuty = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResult<Me>, ApiError, boolean, { previous?: ApiResult<Me> }>({
    mutationFn: (isAvailable) => api.patch<Me>("/users/me", { isAvailable }),
    onMutate: async (isAvailable) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.me });

      const previous = queryClient.getQueryData<ApiResult<Me>>(queryKeys.me);

      queryClient.setQueryData<ApiResult<Me>>(queryKeys.me, (cached) =>
        cached?.data.technician
          ? {
              ...cached,
              data: { ...cached.data, technician: { ...cached.data.technician, isAvailable } },
            }
          : cached,
      );

      return { previous };
    },
    onError: (error, _isAvailable, context) => {
      queryClient.setQueryData(queryKeys.me, context?.previous);
      toast.error(getErrorMessage(error));
    },
    onSuccess: (_result, isAvailable) => {
      toast.success(
        isAvailable ? "You are on duty and can be given jobs" : "You are off duty: no new jobs",
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });
};
