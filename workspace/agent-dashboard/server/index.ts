/**
 * Agent dashboard server.
 *
 * Single port, single process. Hono serves:
 *   - GET /api/health             → liveness probe (platform default)
 *   - GET /api/<agent-routes>     → mounted from server/routes/*.ts
 *   - GET /*                       → static SPA from ../dist
 *
 * Agent-authored route files in server/routes/ are auto-discovered at
 * module load via `Bun.Glob` + dynamic `import()`. Each file must export:
 *   export const route = new Hono();
 *   export const path = "/api"; // optional, default "/api"
 *
 * A failing route file (syntax error, missing import, etc.) is logged
 * and skipped — the server stays up so /api/health and other routes
 * remain reachable.
 *
 * THIS FILE IS PLATFORM-MANAGED. The agent must not edit it. The
 * agent-dashboard-guard blocks edits.
 */
import { Glob } from "bun";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";

import { actionRoutes } from "./actions";

type RouteModule = {
  route?: Hono;
  path?: string;
};

// When the dashboard is fronted by a path-based ingress (e.g. Cloudflare
// `<host>/dashboard/.*`), the proxy forwards the full path — including
// the prefix — to the origin. Mount the whole Hono app under that prefix
// so `/api/health`, agent-authored routes, and the SPA serveStatic
// catch-all all line up with the URL the browser hits.
//
// Empty by default — standalone `bun run dev:client` previews and the
// existing chat-only deploys still hit `/api/health` directly.
const basePath = process.env.DASHBOARD_BASE_PATH ?? "";
const app = basePath ? new Hono().basePath(basePath) : new Hono();

const allowedOrigins = (process.env.DASHBOARD_ALLOWED_ORIGINS ?? "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

app.use(
  "*",
  cors({
    origin: allowedOrigins.length === 1 && allowedOrigins[0] === "*" ? "*" : allowedOrigins,
    credentials: false
  })
);

app.get("/api/health", (c) =>
  c.json({ ok: true, time: new Date().toISOString() })
);

// Platform-managed Actions surface (lists + dispatches agent triggers).
// See server/actions.ts.
app.route("/", actionRoutes);

// Auto-discover and mount every agent-authored route file under server/routes/.
// Uses Bun.Glob (a runtime API) rather than Vite's `import.meta.glob` — Bun
// doesn't ship the latter (issue oven-sh/bun#6060). Top-level await is
// supported by Bun's ESM loader.
const serverDir = fileURLToPath(new URL(".", import.meta.url));
const routesDir = join(serverDir, "routes");
let routeFiles: string[] = [];
try {
  routeFiles = [...new Glob("*.ts").scanSync({ cwd: routesDir, absolute: false })];
} catch {
  // routes/ doesn't exist yet — treat as empty.
}

for (const rel of routeFiles) {
  let mod: RouteModule;
  try {
    mod = (await import(join(routesDir, rel))) as RouteModule;
  } catch (err) {
    // A broken agent-authored route file should not take down the entire
    // server. Log loudly and continue — /api/health + other routes stay up.
    console.error(
      `[agent-dashboard-server] failed to load server/routes/${rel}:`,
      err
    );
    continue;
  }
  if (!mod.route) {
    console.warn(
      `[agent-dashboard-server] server/routes/${rel} has no exported \`route\`; skipping`
    );
    continue;
  }
  const mountPath = mod.path ?? "/api";
  app.route(mountPath, mod.route);
}

// Serve the SPA from ../dist (sibling of server/). Computed file-relative
// so it works regardless of process.cwd() when the bundle is started.
const distRoot = join(serverDir, "..", "dist");

// Hono's `serveStatic` looks at `c.req.url` (the full request URL) when
// resolving files — `basePath` does NOT strip the prefix for it. So a
// request for `/dashboard/index.html` would otherwise be resolved to
// `<distRoot>/dashboard/index.html` (which doesn't exist) and return 404.
// `rewriteRequestPath` strips the prefix before file resolution so
// `/dashboard/index.html` → `<distRoot>/index.html`, `/dashboard/` →
// `<distRoot>/index.html` (Hono auto-appends defaultDocument for paths
// ending in `/`), and `/dashboard/assets/x.js` → `<distRoot>/assets/x.js`.
const basePathPrefix = basePath ? new RegExp(`^${basePath}`) : null;
app.use(
  "/*",
  serveStatic({
    root: distRoot,
    rewriteRequestPath: basePathPrefix
      ? (path) => path.replace(basePathPrefix, "") || "/"
      : undefined
  })
);

// SPA history fallback. The skeleton's React Router (or any client-side
// router) renders deep paths like `/dashboard/holdings/42` purely
// client-side — there's no file at that path in `dist/`. When `serveStatic`
// can't find a match, return the SPA shell (`index.html`) so the router
// takes over. Only do this for navigations (HTML-looking requests): we
// don't want to hand back `index.html` for missing JS/CSS/img references,
// since the browser will then try to evaluate HTML as a script and the
// real 404 gets hidden.
app.notFound(async (c) => {
  const path = c.req.path;
  const looksLikeAsset = /\.[a-z0-9]{2,5}(?:\?|$)/i.test(path);
  if (looksLikeAsset) {
    return c.text("Not Found", 404);
  }
  const indexFile = Bun.file(join(distRoot, "index.html"));
  if (!(await indexFile.exists())) {
    return c.text("Dashboard not built (dist/index.html missing)", 500);
  }
  return new Response(indexFile, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
});

const port = Number(process.env.PORT ?? 8080);

export default { port, fetch: app.fetch };
