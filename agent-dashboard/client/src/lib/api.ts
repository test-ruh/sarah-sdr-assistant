/**
 * Client-side helpers for talking to the agent's dashboard server.
 *
 * `apiBaseUrl` resolves to:
 *   - "" (empty string) in preview / dev builds — no VITE_DASHBOARD_API_URL set.
 *     Tabs gate `useQuery` with `enabled: !!apiBaseUrl` so fetches are skipped
 *     during preview; stubs render via `placeholderData`.
 *   - The deployment's API URL in production builds — `save_agent` /
 *     deployment harness sets `VITE_DASHBOARD_API_URL` at build time.
 *
 * THIS FILE IS PLATFORM-MANAGED.
 */
export const apiBaseUrl: string =
  (import.meta.env.VITE_DASHBOARD_API_URL as string | undefined) ?? "";
