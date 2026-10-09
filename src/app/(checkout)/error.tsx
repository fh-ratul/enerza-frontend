"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function CheckoutError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorView error={error} retry={retry} homeHref="/dashboard/bills" homeLabel="Back to bills" />;
}
