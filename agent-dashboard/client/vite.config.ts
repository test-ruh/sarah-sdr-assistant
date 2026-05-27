import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

/**
 * Vite config for the agent-dashboard skeleton.
 *
 * The skeleton is rendered into each agent's `.openclaw/agent-dashboard/`
 * directory. `bun run dev` opens the dashboard in preview mode with
 * synthetic data (no backend required).
 *
 * The `@/*` alias mirrors the `tsconfig.json` paths so imports work the
 * same way at runtime as they do for TypeScript.
 */
export default defineConfig({
  root: path.resolve(__dirname),
  publicDir: path.resolve(__dirname, "public"),
  plugins: [react(), tailwindcss()],
  // VITE_BASE is set by the orchestrator at build time on production
  // deploys to match the Cloudflare path ingress (e.g. `/dashboard/`).
  // When unset (local `bun run dev:client`, the builder iframe preview),
  // fall back to relative paths so the SPA works under any URL prefix.
  //
  // The builder UI mounts the iframe at `/conversations/<id>/dashboard-preview/`,
  // NOT at the origin root — with `base: "./"`, assets in index.html
  // become `assets/...` and resolve relative to the iframe's current URL.
  base: process.env.VITE_BASE ?? "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  server: {
    port: 5174,
    strictPort: false,
    open: "/?preview=1"
  },
  preview: {
    port: 5174,
    strictPort: false
  },
  build: {
    outDir: path.resolve(__dirname, "..", "dist"),
    emptyOutDir: true,
    sourcemap: true
  }
});
