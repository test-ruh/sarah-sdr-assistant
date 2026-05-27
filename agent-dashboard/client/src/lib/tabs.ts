import { defaultRouteId, routes } from "@/routes.config";

/**
 * Tab routing helpers for the dashboard.
 *
 * In the frame model, the dashboard's tabs are NOT a fixed list — the
 * agent declares them in `routes.config.ts`. These helpers bridge the
 * registry to `location.hash` so the URL reflects the active tab and a
 * deep-link / refresh restores it.
 *
 * Two id namespaces are recognised:
 *
 *   - **Reserved platform ids** (underscore-prefixed, e.g. `_actions`):
 *     entries injected by `app.tsx` directly into the sidebar. Always
 *     accepted as "known" even though they're not in `routes.config.ts`.
 *     The platform default-active id is `_actions` — the operator's
 *     first view on a fresh dashboard load.
 *
 *   - **Agent ids** (everything else): declared in `routes.config.ts`.
 *     The platform tester enforces a single convention: a route with
 *     `id: "overview"` must exist. Other tab ids are agent-chosen
 *     kebab-case strings.
 */

export type TabId = string;

/**
 * Platform-injected sidebar entries use underscore-prefixed ids. The
 * tester rejects agent-declared route ids with this prefix
 * (`agent-route-id-reserved`) to prevent collisions.
 */
export const PLATFORM_RESERVED_TAB_PREFIX = "_";

/**
 * The platform-injected sidebar entry that's active on a fresh load
 * (no `#hash` in the URL). Per the dashboard-command-center design doc,
 * the operator's first view is "what can I do?", i.e. the Actions tab.
 */
export const PLATFORM_DEFAULT_TAB_ID = "_actions";

const knownIds = (): ReadonlyArray<string> => routes.map((r) => r.id);

const isReservedTabId = (value: string): boolean =>
  value.startsWith(PLATFORM_RESERVED_TAB_PREFIX);

export const isKnownTabId = (value: string): boolean =>
  isReservedTabId(value) || knownIds().includes(value);

/**
 * Resolve the default-active tab when no hash is in the URL.
 *
 * Platform-injected Actions always wins — the operator opens the
 * dashboard and immediately sees what they can DO with this agent.
 * The agent's `defaultRouteId` from `routes.config.ts` is intentionally
 * not consulted here; it remains exported as a documentation aid but no
 * longer drives runtime behaviour.
 */
const defaultId = (): string => {
  // Touch `defaultRouteId` so the import stays tracked; the agent's
  // declared default is fallback behaviour we don't use today but may
  // surface as a "second-tab default" in a future revision.
  void defaultRouteId;
  return PLATFORM_DEFAULT_TAB_ID;
};

/** Read the active tab from `location.hash`, falling back to the platform default. */
export const readActiveTab = (): TabId => {
  const raw = (globalThis.location?.hash || "").replace(/^#\/?/, "");
  return raw && isKnownTabId(raw) ? raw : defaultId();
};

/** Write the active tab to `location.hash`. */
export const writeActiveTab = (id: TabId): void => {
  if (globalThis.location) {
    globalThis.location.hash = `#${id}`;
  }
};
