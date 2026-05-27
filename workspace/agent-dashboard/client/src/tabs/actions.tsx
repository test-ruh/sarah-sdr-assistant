// src/agent/templates/agent-dashboard-skeleton/client/src/tabs/actions.tsx
/**
 * Default Actions tab — the operator's "what can I do" surface.
 *
 * Fetches GET /api/actions, renders one card per action, POSTs to
 * /api/actions/:id on button click. The agent CAN replace this tab
 * with a custom implementation, but the replacement MUST keep calling
 * /api/actions / /api/actions/:id so the platform's dispatch keeps
 * working.
 *
 * Stub fallback: empty list. In preview mode (apiBaseUrl=""), useQuery's
 * fetch goes to /api/actions (same origin as the builder UI) which 404s,
 * so React Query reports an error and the empty state renders. In a
 * deployed bundle the agent's own Hono server answers /api/actions.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  CardContent
} from "@ruh-ai/ruh-design-system";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { apiBaseUrl } from "@/lib/api";

type Trigger =
  | { kind: "cron"; name: string }
  | { kind: "workflow"; file: string };

type Action = {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  trigger: Trigger;
};

const stubActions: Action[] = [];

const iconFor = (name: string | undefined): LucideIcon => {
  if (!name) return Icons.Zap;
  const candidate = (Icons as unknown as Record<string, LucideIcon>)[name];
  return candidate ?? Icons.Zap;
};

async function fetchActions(): Promise<Action[]> {
  const response = await fetch(`${apiBaseUrl}/api/actions`);
  if (!response.ok) {
    throw new Error(`Failed to load actions (${response.status})`);
  }
  const payload = (await response.json()) as { actions: Action[] };
  return payload.actions;
}

type TriggerResult =
  | { kind: "dispatched"; dispatched: string }
  | { kind: "skipped"; reason: string };

async function triggerAction(id: string): Promise<TriggerResult> {
  const response = await fetch(`${apiBaseUrl}/api/actions/${id}`, {
    method: "POST"
  });
  if (response.status === 503) {
    return {
      kind: "skipped",
      reason: "Preview mode — actions disabled when not deployed"
    };
  }
  if (!response.ok) {
    let detail = "";
    try {
      const j = (await response.json()) as { error?: string };
      detail = j.error ?? "";
    } catch {
      detail = response.statusText;
    }
    throw new Error(`Failed to trigger (${response.status})${detail ? ": " + detail : ""}`);
  }
  const json = (await response.json()) as { dispatched: string };
  return { kind: "dispatched", dispatched: json.dispatched };
}

function TriggerChip({ trigger }: { trigger: Trigger }) {
  if (trigger.kind === "cron") {
    return (
      <Badge variant="secondary" className="gap-1">
        CRON · {trigger.name}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      WORKFLOW · {trigger.file}
    </Badge>
  );
}

function ActionCard({ action }: { action: Action }) {
  const [toast, setToast] = useState<{ kind: "ok" | "info" | "err"; text: string } | null>(null);
  const { mutate, isPending } = useMutation({
    mutationFn: () => triggerAction(action.id),
    onMutate: () => setToast(null),
    onSuccess: (result) => {
      if (result.kind === "skipped") {
        setToast({ kind: "info", text: `${action.label}: ${result.reason}` });
      } else {
        setToast({
          kind: "ok",
          text: `${action.label} triggered (${result.dispatched})`
        });
      }
    },
    onError: (err) => setToast({ kind: "err", text: (err as Error).message })
  });
  const Icon = iconFor(action.icon);

  return (
    <Card size="sm">
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{action.label}</div>
            {action.description ? (
              <p className="m-0 text-sm text-muted-foreground">{action.description}</p>
            ) : null}
            <div className="mt-2">
              <TriggerChip trigger={action.trigger} />
            </div>
          </div>
          <Button
            variant="default"
            disabled={isPending}
            onClick={() => mutate()}
            className="self-center"
          >
            {isPending ? "…" : "▶ Run now"}
          </Button>
        </div>
        {toast ? (
          <div
            role={toast.kind === "err" ? "alert" : "status"}
            aria-live={toast.kind === "err" ? "assertive" : "polite"}
            className={`mt-3 rounded-md px-3 py-2 text-xs ${
              toast.kind === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : toast.kind === "info"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-rose-50 text-rose-700"
            }`}
          >
            {toast.text}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ActionsTab() {
  const { data = stubActions, isFetching, isError } = useQuery<Action[]>({
    queryKey: ["dashboard-actions"],
    queryFn: fetchActions,
    placeholderData: stubActions,
    enabled: !!apiBaseUrl
  });

  return (
    <section aria-label="Agent actions" className="space-y-4 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Icons.Zap size={18} /> Actions
        </h2>
        <span className="text-xs text-muted-foreground">
          {data.length} action{data.length === 1 ? "" : "s"} available
          {isFetching ? " · refreshing…" : ""}
        </span>
      </div>
      <p className="m-0 text-sm text-muted-foreground">
        Trigger this agent&apos;s workflows on-demand. Each runs asynchronously on the agent&apos;s runtime.
      </p>

      {isError ? (
        <Card size="sm">
          <CardContent>
            <p className="m-0 text-sm text-rose-700">Failed to load actions from <code>/api/actions</code>.</p>
          </CardContent>
        </Card>
      ) : data.length === 0 ? (
        <Card size="sm">
          <CardContent>
            <p className="m-0 text-sm text-muted-foreground">
              No actions available. Declare an <code>actions:</code> block in <code>openclaw.json</code> or define workflows.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      )}

      <p className="m-0 text-xs text-muted-foreground">
        Customize this list by editing the <code>actions:</code> block in <code>.openclaw/openclaw.json</code>, or replace this entire tab by editing <code>client/src/tabs/actions.tsx</code>.
      </p>
    </section>
  );
}

export default ActionsTab;
