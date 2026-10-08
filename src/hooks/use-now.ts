"use client";

import { useMemo, useSyncExternalStore } from "react";

// One clock for the whole page, however many components watch it: the timer
// runs only while something is subscribed.

const TICK_MS = 30_000;

let currentMs: number | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

const tick = () => {
  currentMs = Date.now();

  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  if (listeners.size === 1) {
    currentMs = Date.now();
    timer = setInterval(tick, TICK_MS);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      clearInterval(timer);
      currentMs = null;
    }
  };
};

const getSnapshot = () => currentMs;
const getServerSnapshot = () => null;

/**
 * The current time, refreshed every half minute, for countdowns and
 * "x minutes ago". It is null on the server and until the component has
 * hydrated: the server cannot know the visitor's clock, so nothing
 * time-relative is rendered before then.
 */
export const useNow = (): Date | null => {
  const ms = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => (ms === null ? null : new Date(ms)), [ms]);
};
