"use client";

import { useEffect, useState } from "react";

/** The value, once it has stopped changing for `delayMs`. */
export const useDebounce = <T>(value: T, delayMs = 350): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};
