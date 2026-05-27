import { Badge } from "@ruh-ai/ruh-design-system";
import type * as React from "react";

import EmptyState from "./empty-state";
import WidgetCard from "./widget-card";
import type { CommonWidgetProps, StatusBadgeBinding } from "./types";

type StatusBadgeProps = CommonWidgetProps & {
  binding: StatusBadgeBinding;
};

const variantFor = (status: string): React.ComponentProps<typeof Badge>["variant"] => {
  const lower = status.toLowerCase();
  if (["ok", "active", "running", "success", "succeeded", "healthy"].includes(lower)) {
    return "default";
  }
  if (["paused", "pending", "queued", "draft", "waiting"].includes(lower)) {
    return "secondary";
  }
  if (["failing", "failed", "error", "stuck", "broken", "down"].includes(lower)) {
    return "destructive";
  }
  return "outline";
};

const formatTime = (value: unknown): string | null => {
  if (value == null) return null;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed).toLocaleString();
    return value;
  }
  return null;
};

/**
 * Status-badge widget. Reads the latest row's status column and renders
 * a Ruh DS `Badge` with the matching tone (default = primary, secondary
 * = neutral, destructive = error). Optional label + time line shown
 * beneath. Per AB-370 the status column should be low-cardinality
 * (validated by tester upstream).
 */
export function StatusBadge({ title, hint, data, binding, emptyLabel }: StatusBadgeProps) {
  const latest = data[data.length - 1];

  if (!latest) {
    return (
      <WidgetCard title={title} hint={hint} minHeight={140}>
        <EmptyState label={emptyLabel ?? `No data for ${title}`} />
      </WidgetCard>
    );
  }

  const status = String(latest[binding.status] ?? "unknown");
  const label = binding.label ? String(latest[binding.label] ?? "") : null;
  const time = binding.time ? formatTime(latest[binding.time]) : null;

  return (
    <WidgetCard title={title} hint={hint} minHeight={140}>
      <div className="flex flex-col gap-2">
        <Badge variant={variantFor(status)} className="self-start">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
          {status}
        </Badge>
        {label && <span className="text-sm">{label}</span>}
        {time && <span className="text-[11px] text-muted-foreground">{time}</span>}
      </div>
    </WidgetCard>
  );
}

export default StatusBadge;
