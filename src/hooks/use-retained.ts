"use client";

import { useState } from "react";

/**
 * The last non-null value. A dialog that shows "the selected item" uses this
 * to keep its content while it animates shut, after the selection is cleared.
 */
export const useRetained = <T>(value: T | null): T | null => {
  const [retained, setRetained] = useState(value);

  if (value !== null && value !== retained) {
    setRetained(value);
  }

  return value ?? retained;
};
