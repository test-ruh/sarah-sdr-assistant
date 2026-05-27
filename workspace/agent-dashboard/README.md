# Agent Dashboard Skeleton

Standardized Vite + React template for the per-agent dashboard at `.openclaw/workspace/agent-dashboard/`.

Every agent produced by `openclaw-builder-agent` ships with this skeleton plus a generated `spec.generated.ts` describing **what** content goes in each slot. The layout — left sidebar, identity card, 5 fixed top tabs (Overview / Runs / Knowledge / Permissions / Settings), KPI strip, two-column row, right-rail Tools — is the same for every agent. Only the widget bindings vary.

References:
- AB-370 — Agent Dashboard standardized template (this ticket)
- AB-39 — Dynamic dashboard for each agent (parent)

## Develop locally

```bash
# A GitHub Packages token with read:packages scope is required for @ruh-ai/ruh-design-system
export GITHUB_PACKAGES_TOKEN=ghp_xxx

bun install
bun run dev      # opens http://localhost:5174/?preview=1
bun run build    # production bundle to ../dist
bun run typecheck
```

## Modes

- **`?preview=1`** (default in `bun run dev`) — preview mode. MSW intercepts `/api/analytics/query` and returns synthetic data so the dashboard fills out without any backend. A watermark in the corner labels every page as preview.
- **default (no `?preview=1`)** — production mode. MSW is disabled; the dashboard reads `/config.json` (written by `setup.sh` on the deployed VM) and calls the gateway's analytics endpoint over real data.

Both modes ship in the same bundle. Toggling is purely URL-driven.

## Layout boundaries

- The skeleton itself owns: layout, theming, routing within the 5 tabs, MSW + synthetic data wiring, error boundaries.
- The generated `spec.generated.ts` owns: which widgets appear in each tab, which `result_*` columns they bind to, which triggers exist.
- Custom features that fit the 5-tab template land as widgets. Anything that needs a form / approval queue / custom backend belongs in the v2-Deferrals section of `design.md` — not silently dropped.
