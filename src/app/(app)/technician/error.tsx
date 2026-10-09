"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function TechnicianError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorView error={error} retry={retry} homeHref="/technician" homeLabel="Back to my jobs" />;
}
