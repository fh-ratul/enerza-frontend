"use client";

import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

const subscribe = (listener: () => void) => {
  const media = window.matchMedia(MOBILE_QUERY);

  media.addEventListener("change", listener);

  return () => media.removeEventListener("change", listener);
};

const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;
// The server cannot know the viewport: render the desktop layout and correct after hydration.
const getServerSnapshot = () => false;

/** True below the `md` breakpoint. */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
