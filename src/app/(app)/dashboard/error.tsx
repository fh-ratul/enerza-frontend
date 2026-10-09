"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function CustomerError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorView error={error} retry={retry} homeHref="/dashboard" homeLabel="Back to the overview" />;
}
