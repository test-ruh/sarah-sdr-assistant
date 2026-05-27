import { ThemeProvider, TooltipProvider } from "@ruh-ai/ruh-design-system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createRoot } from "react-dom/client";

import App from "@/app";
import { IframeThemeSync } from "@/lib/iframe-theme-sync";
import "@/styles.css";

/**
 * Entry point for the agent-dashboard skeleton.
 *
 * Composes the wireframe-aligned shell (sidebar | center | right rail) via
 * `<App />`. The shell is shared by every agent's dashboard; only the
 * content inside each tab varies per agent.
 *
 * Wraps the app in three providers:
 *   - `ThemeProvider`: surfaces the platform's dark/light state and
 *     applies the matching theme tokens to the DOM.
 *   - `TooltipProvider`: pre-positions every DS Tooltip so the
 *     sidebar / top-tabs / right-rail hover hints render without
 *     having to wrap each one individually.
 *   - `QueryClientProvider`: backs the AB-404 hybrid fetch pattern
 *     every agent-authored tab uses (`useQuery(...) +
 *     placeholderData: stub<Thing>`). Without this, any tab calling
 *     `useQuery` throws "No QueryClient set" at render time and the
 *     whole dashboard unmounts to a blank screen.
 *
 * `queryClient` is constructed once at module load so React's StrictMode
 * remounts don't churn the cache. Defaults are conservative — single
 * retry, no refetch-on-focus — to keep behaviour predictable for
 * dashboard tabs that fetch hourly-refreshed `result_*` rows.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Agent Dashboard root element not found");
}

createRoot(rootEl).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <IframeThemeSync />
      <TooltipProvider delayDuration={200}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>
);
