import { Button } from "@ruh-ai/ruh-design-system";
import { Play } from "lucide-react";
import { useState } from "react";

import WidgetCard from "./widget-card";
import type { ButtonTriggerBinding } from "./types";

type ButtonTriggerProps = {
  title: string;
  hint?: string;
  binding: ButtonTriggerBinding;
  /** Optional click handler. When omitted the button shows a disabled state. */
  onTrigger?: (binding: ButtonTriggerBinding) => Promise<void> | void;
};

/**
 * Trigger button — runs a workflow when clicked. The button label and the
 * chat-message template come from the binding (which the spec generator
 * derives from the agent's cron / user-invocable skills).
 *
 * Built on Ruh DS `Button` so the variants, focus ring, disabled state,
 * and motion match the rest of the platform. The "Triggered" success
 * state uses variant="secondary" so it reads as a transient ack rather
 * than the default primary call-to-action.
 *
 * `button-trigger` is the v1 mechanism for letting an operator invoke a
 * workflow manually from the dashboard. Form-driven triggers (date pickers,
 * structured inputs) are explicitly v2 — see the `## v2 Deferrals` section
 * in design.md per AB-358 / AB-370.
 */
export function ButtonTrigger({ title, hint, binding, onTrigger }: ButtonTriggerProps) {
  const [state, setState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (): Promise<void> => {
    if (!onTrigger) return;
    setState("running");
    setError(null);
    try {
      await onTrigger(binding);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setState("error");
    }
  };

  const disabled = !onTrigger || state === "running";

  return (
    <WidgetCard title={title} hint={hint} minHeight={140}>
      <div className="flex flex-col gap-2">
        <Button
          variant={state === "done" ? "secondary" : "default"}
          size="sm"
          onClick={handleClick}
          disabled={disabled}
          className="self-start"
        >
          <Play size={14} />
          {state === "running" ? "Triggering…" : state === "done" ? "Triggered" : "Run now"}
        </Button>
        <p className="m-0 text-xs text-muted-foreground">
          Sends: <span className="italic">"{binding.chat_message}"</span>
        </p>
        {state === "error" && error && (
          <p className="m-0 text-xs text-destructive">Error: {error}</p>
        )}
      </div>
    </WidgetCard>
  );
}

export default ButtonTrigger;
