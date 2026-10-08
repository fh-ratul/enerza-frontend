"use client";

import { useEffect, useState } from "react";

/**
 * The current time, refreshed on an interval, for countdowns and "x minutes
 * ago". It is null until the component has mounted: the server cannot know
 * the visitor's clock, so nothing time-relative is rendered before hydration.
 */
export const useNow = (intervalMs = 30_000): Date | null => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const timer = setInterval(() => setNow(new Date()), intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
};
