"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { googleLoginAction } from "./actions";

// The slice of Google Identity Services this component uses.
type GoogleAccounts = {
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: { credential?: string }) => void;
      ux_mode?: "popup";
    }) => void;
    renderButton: (
      parent: HTMLElement,
      options: {
        theme: string;
        size: string;
        text: string;
        shape: string;
        width: number;
        locale?: string;
      },
    ) => void;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * "Continue with Google". Google signs the visitor in and hands the browser
 * an ID token; the server passes it to the API, which verifies it and issues
 * its own session. Rendered only when a Google client id is configured.
 */
export function GoogleSignIn() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isScriptReady, setScriptReady] = useState(false);
  const [isPending, startTransition] = useTransition();
  const redirectTarget = searchParams.get("redirect") ?? undefined;

  const handleCredential = useCallback(
    (credential: string | undefined) => {
      if (!credential) {
        toast.error("Google did not return a sign-in token. Please try again.");

        return;
      }

      startTransition(async () => {
        queryClient.clear();

        const result = await googleLoginAction(credential, redirectTarget);

        if (result && !result.ok) {
          toast.error(result.message);
        }
      });
    },
    [queryClient, redirectTarget],
  );

  useEffect(() => {
    const container = buttonRef.current;

    if (!isScriptReady || !CLIENT_ID || !window.google || !container) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => handleCredential(response.credential),
      ux_mode: "popup",
    });
    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      width: Math.min(container.offsetWidth || 320, 400),
      // The rest of the page is in English; without this Google follows the browser.
      locale: "en",
    });
  }, [handleCredential, isScriptReady]);

  if (!CLIENT_ID) {
    return null;
  }

  return (
    <div className="flex min-h-11 flex-col items-center justify-center">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      {isPending ? (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner /> Signing in with Google…
        </p>
      ) : null}
      {/* Google draws its own button into this element. */}
      <div ref={buttonRef} className={isPending ? "hidden" : "flex w-full justify-center"} />
    </div>
  );
}
