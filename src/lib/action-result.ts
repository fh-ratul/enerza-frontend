import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";
import type { ApiFieldError } from "@/types/api";

/**
 * What a Server Action returns to the form that called it. Failures are
 * returned, not thrown: a thrown error would reach the browser as an opaque
 * "something went wrong" in production, and the form could not show which
 * field to fix.
 */
export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: ApiFieldError[] };

/**
 * Puts the API's field errors under the matching form fields. Returns false
 * when none of them belongs to a field the form has, so the caller can show
 * the message as a general error instead.
 */
export const applyFieldErrors = <T extends FieldValues>(
  fieldErrors: ApiFieldError[] | undefined,
  setError: UseFormSetError<T>,
  fieldNames: readonly string[],
): boolean => {
  let applied = false;

  for (const error of fieldErrors ?? []) {
    // "areas.0.code" belongs to the field named exactly that, or to "areas".
    const name = fieldNames.includes(error.path) ? error.path : error.path.split(".")[0];

    if (name && fieldNames.includes(name)) {
      setError(name as FieldPath<T>, { type: "server", message: error.message });
      applied = true;
    }
  }

  return applied;
};
