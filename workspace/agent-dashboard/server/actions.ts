// src/agent/templates/agent-dashboard-skeleton/server/actions.ts
/**
 * Platform-managed Actions handler.
 *
 * The dashboard's "What can I do" surface: lists triggerable actions and
 * dispatches each on click via `Bun.spawn`.
 *
 * Discovery (fallback hierarchy when `openclaw.json` has no `actions:` block):
 *   1. Explicit `actions:` array in openclaw.json (use verbatim).
 *   2. Auto-derive from cron/jobs.json (one cron-kind action per job).
 *   3. Auto-derive from `workflows:` map (one workflow-kind action per workflow).
 *   4. Empty list (the UI shows an empty state).
 *
 * Dispatch:
 *   - trigger.kind === "cron"     → resolve id with `openclaw cron list --json`, then `openclaw cron run <id>`
 *   - trigger.kind === "workflow" → `lobster run <file>`
 *
 * Returns 503 if neither CLI is on PATH (preview / local dev — agent's VM
 * has both installed when deployed).
 *
 * THIS FILE IS PLATFORM-MANAGED. The agent must not edit it. The guard
 * blocks edits; the tester SHA-256s it against the skeleton.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { Hono } from "hono";

type Trigger =
  | { kind: "cron"; name: string }
  | { kind: "workflow"; file: string };

export type Action = {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  trigger: Trigger;
};

// Deployed layout:
//   <workspace-root>/openclaw.json
//   <workspace-root>/cron/jobs.json
//   <workspace-root>/agent-dashboard/server/actions.ts  ← this file
// So workspaceRoot = ../.. from this file.
const serverDir = fileURLToPath(new URL(".", import.meta.url));
const workspaceRoot = join(serverDir, "..", "..");
const openclawJsonPath = join(workspaceRoot, "openclaw.json");
const cronJobsPath = join(workspaceRoot, "cron", "jobs.json");

type OpenclawJson = {
  actions?: Action[];
  workflows?: Record<string, string>;
};

type CronJson = {
  name: string;
  enabled?: boolean;
  schedule?: { kind: string; expr?: string; tz?: string };
  sessionTarget?: string;
  payload?: { message?: string };
};

type CronJobsJson = {
  jobs?: CronJson[];
};

const titleCase = (s: string): string =>
  s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

const truncate = (s: string, n: number): string =>
  s.length <= n ? s : `${s.slice(0, n - 1)}…`;

const readOpenclawJson = async (): Promise<OpenclawJson> => {
  const raw = await readFile(openclawJsonPath, "utf8");
  return JSON.parse(raw) as OpenclawJson;
};

const readCronList = async (): Promise<CronJson[]> => {
  try {
    const raw = await readFile(cronJobsPath, "utf8");
    const parsed = JSON.parse(raw) as CronJobsJson | CronJson[];
    const jobs = Array.isArray(parsed) ? parsed : parsed.jobs;
    return Array.isArray(jobs) ? jobs.filter((job) => job.name) : [];
  } catch {
    return [];
  }
};

const deriveActionsFromCrons = (crons: CronJson[]): Action[] =>
  crons.map((c) => ({
    id: c.name,
    label: titleCase(c.name),
    description: c.payload?.message ? truncate(c.payload.message, 120) : undefined,
    icon: "Clock",
    trigger: { kind: "cron", name: c.name }
  }));

const deriveActionsFromWorkflows = (workflows: Record<string, string>): Action[] =>
  Object.entries(workflows).map(([id, file]) => ({
    id,
    label: titleCase(id),
    description: `Run the ${id} workflow`,
    icon: "Workflow",
    trigger: { kind: "workflow", file }
  }));

const listActions = async (): Promise<Action[]> => {
  let openclaw: OpenclawJson;
  try {
    openclaw = await readOpenclawJson();
  } catch (err) {
    // Missing file → empty list (preview / fresh bundle).
    // Malformed JSON / other errors → rethrow so the route returns 500.
    if ((err as { code?: string }).code === "ENOENT") {
      return [];
    }
    throw err;
  }
  if (openclaw.actions && openclaw.actions.length > 0) {
    // Validate uniqueness — duplicate ids would silently shadow on dispatch.
    const seen = new Set<string>();
    for (const a of openclaw.actions) {
      if (seen.has(a.id)) {
        throw new Error(`Duplicate action id "${a.id}" in openclaw.json`);
      }
      seen.add(a.id);
    }
    return openclaw.actions;
  }
  const crons = await readCronList();
  if (crons.length > 0) return deriveActionsFromCrons(crons);
  if (openclaw.workflows && Object.keys(openclaw.workflows).length > 0) {
    return deriveActionsFromWorkflows(openclaw.workflows);
  }
  return [];
};

const findCronJobId = (value: unknown, name: string): string | undefined => {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findCronJobId(item, name);
      if (found) return found;
    }
    return undefined;
  }
  if (!value || typeof value !== "object") return undefined;
  const record = value as Record<string, unknown>;
  if (record.name === name) {
    const id = record.id ?? record.jobId;
    if (typeof id === "string" && id.length > 0) return id;
  }
  for (const child of Object.values(record)) {
    const found = findCronJobId(child, name);
    if (found) return found;
  }
  return undefined;
};

const resolveCronJobId = async (name: string): Promise<string> => {
  const proc = Bun.spawn(["openclaw", "cron", "list", "--all", "--json"], {
    cwd: workspaceRoot,
    stdout: "pipe",
    stderr: "pipe"
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited
  ]);
  if (exitCode !== 0) {
    throw new Error(stderr.trim() || `openclaw cron list failed with exit code ${exitCode}`);
  }
  const parsed = JSON.parse(stdout) as unknown;
  const id = findCronJobId(parsed, name);
  if (!id) {
    throw new Error(`Cron job "${name}" is not registered. Run bash cron/register-cron.sh first.`);
  }
  return id;
};

const dispatchAction = async (
  action: Action
): Promise<{ kind: string; dispatched: string }> => {
  const cmd: string[] = action.trigger.kind === "cron"
    ? ["openclaw", "cron", "run", await resolveCronJobId(action.trigger.name)]
    : ["lobster", "run", action.trigger.file];
  // Bun.spawn throws synchronously if the binary isn't on PATH. We catch
  // that at the route handler and return 503. A returned proc means the
  // spawn was accepted; the actual run continues async on the runtime.
  Bun.spawn(cmd, {
    cwd: workspaceRoot,
    stdout: "pipe",
    stderr: "pipe"
  });
  return {
    kind: action.trigger.kind,
    dispatched: cmd.join(" ")
  };
};

export const actionRoutes = new Hono();

actionRoutes.get("/api/actions", async (c) => {
  try {
    const actions = await listActions();
    return c.json({ actions });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 500);
  }
});

actionRoutes.post("/api/actions/:id", async (c) => {
  const id = c.req.param("id");
  let actions: Action[];
  try {
    actions = await listActions();
  } catch (err) {
    return c.json({ error: `Failed to read actions: ${(err as Error).message}` }, 500);
  }
  const action = actions.find((a) => a.id === id);
  if (!action) {
    return c.json({ error: `No action with id "${id}"` }, 404);
  }
  try {
    const result = await dispatchAction(action);
    return c.json(
      {
        id: action.id,
        kind: result.kind,
        dispatched: result.dispatched,
        startedAt: new Date().toISOString()
      },
      202
    );
  } catch (err) {
    const errObj = err as { code?: string; message?: string };
    const message = errObj.message ?? String(err);
    // Bun.spawn sets err.code === "ENOENT" when the binary isn't on PATH.
    if (errObj.code === "ENOENT") {
      return c.json(
        {
          error: `CLI not available: ${message}. This is expected in preview / local-dev mode.`
        },
        503
      );
    }
    return c.json({ error: message }, 500);
  }
});

export default actionRoutes;
