"use client";

import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type ApiError, getErrorMessage } from "@/lib/api/errors";
import type { ApiResult } from "@/types/api";

type Options<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<ApiResult<TData>>;
  /** Cache roots to refetch once the change has gone through. */
  invalidate?: QueryKey[];
  /** Shown as a toast; defaults to the API's own message. `false` shows nothing. */
  successMessage?: string | false | ((result: ApiResult<TData>) => string);
  onSuccess?: (result: ApiResult<TData>, variables: TVariables) => void;
  /**
   * Return true when the error has been shown (e.g. under form fields); the
   * default toast is then skipped.
   */
  onError?: (error: ApiError, variables: TVariables) => boolean | undefined;
};

/**
 * A write to the API with the app's standard follow-up: refetch what changed,
 * confirm with a toast, and report a failure in the API's own words.
 */
export const useApiMutation = <TData, TVariables = void>({
  mutationFn,
  invalidate = [],
  successMessage,
  onSuccess,
  onError,
}: Options<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation<ApiResult<TData>, ApiError, TVariables>({
    mutationFn,
    onSuccess: async (result, variables) => {
      await Promise.all(
        invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );

      if (successMessage !== false) {
        toast.success(
          typeof successMessage === "function"
            ? successMessage(result)
            : (successMessage ?? result.message),
        );
      }

      onSuccess?.(result, variables);
    },
    onError: (error, variables) => {
      if (!onError?.(error, variables)) {
        toast.error(getErrorMessage(error));
      }
    },
  });
};
