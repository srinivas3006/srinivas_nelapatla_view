import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

// Privacy-friendly analytics via GoatCounter (free, cookieless, no consent
// banner needed). Off unless VITE_GOATCOUNTER_CODE is set at build time, e.g.
// "srinivas" for https://srinivas.goatcounter.com.

const CODE = import.meta.env.VITE_GOATCOUNTER_CODE as string | undefined;

declare global {
  interface Window {
    goatcounter?: { count: (vars: { path: string }) => void };
  }
}

/** <head> script tag for the GoatCounter counter, when configured. */
export const analyticsScripts = CODE
  ? [
      {
        src: "https://gc.zgo.at/count.js",
        async: true,
        "data-goatcounter": `https://${CODE}.goatcounter.com/count`,
      },
    ]
  : [];

/** Counts client-side navigations (count.js only counts the first page load). */
export function useAnalyticsPageviews() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const first = useRef(true);
  useEffect(() => {
    if (!CODE) return;
    if (first.current) {
      first.current = false;
      return;
    }
    window.goatcounter?.count({ path: pathname });
  }, [pathname]);
}
