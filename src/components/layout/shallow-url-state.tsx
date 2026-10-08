"use client";

import type { ReactNode } from "react";
import { UrlStateModeContext } from "@/hooks/use-url-state";

/**
 * Everything underneath updates the URL's query string without a server
 * round trip (see UrlStateMode). Wraps the dashboards, whose lists are
 * fetched in the browser.
 */
export function ShallowUrlState({ children }: { children: ReactNode }) {
  return <UrlStateModeContext value="shallow">{children}</UrlStateModeContext>;
}
