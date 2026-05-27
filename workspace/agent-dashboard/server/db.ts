/**
 * Postgres connection pool for the agent dashboard's server.
 *
 * Reads `PG_CONNECTION_STRING` (same env var the agent's cron jobs use).
 * Exports the `sql` tagged-template function from postgres.js — and a
 * `db` alias for routes that prefer that name. Both refer to the same
 * pool; pick whichever reads better at the call site. Agent routes
 * use `${value}` interpolation, which becomes a bind param (no SQL
 * injection possible by construction).
 *
 * Test-mode override: when `DASHBOARD_TEST_PG_OVERRIDE` is set (only
 * by the platform's tester), the pool connects to that URL instead.
 * Production code path is unchanged; production never sets this env.
 *
 * Optional pool-tuning env vars (all integers; default in parentheses):
 *   - `PG_POOL_MAX` (10)               — max concurrent connections
 *   - `PG_IDLE_TIMEOUT_SECONDS` (30)   — idle connection drop window
 *   - `PG_CONNECT_TIMEOUT_SECONDS` (5) — initial-connect deadline
 * Each fails fast at module load if set to a non-numeric value.
 *
 * THIS FILE IS PLATFORM-MANAGED. The agent must not edit it. The
 * agent-dashboard-guard blocks edits.
 */
import postgres from "postgres";

const connectionString =
  process.env.DASHBOARD_TEST_PG_OVERRIDE ?? process.env.PG_CONNECTION_STRING;

if (!connectionString) {
  throw new Error(
    "PG_CONNECTION_STRING is required to start the agent-dashboard server"
  );
}

const envInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(
      `${name} must be a non-negative finite number, got: ${JSON.stringify(raw)}`
    );
  }
  return n;
};

export const sql = postgres(connectionString, {
  max: envInt("PG_POOL_MAX", 10),
  idle_timeout: envInt("PG_IDLE_TIMEOUT_SECONDS", 30),
  connect_timeout: envInt("PG_CONNECT_TIMEOUT_SECONDS", 5),
  prepare: false
});

export const db = sql;
