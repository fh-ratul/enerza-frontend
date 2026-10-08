import type { ApiFieldError } from "@/types/api";

/** A failed API call, carrying the API's own status, message and field errors. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: ApiFieldError[];

  constructor(statusCode: number, message: string, errors: ApiFieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }

  /** Field errors only: the API also reports general errors with an empty path. */
  get fieldErrors(): ApiFieldError[] {
    return this.errors.filter((error) => error.path !== "");
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/** A message that is safe and useful to show a person. */
export const getErrorMessage = (error: unknown, fallback = FALLBACK_MESSAGE): string => {
  if (isApiError(error)) {
    return error.message || fallback;
  }

  if (error instanceof TypeError) {
    // fetch() rejects with a TypeError when the network is unreachable
    return "You appear to be offline. Check your connection and try again.";
  }

  return fallback;
};
