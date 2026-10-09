"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function AuthError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return <ErrorView error={error} retry={retry} homeHref="/" homeLabel="Go to the home page" />;
}
