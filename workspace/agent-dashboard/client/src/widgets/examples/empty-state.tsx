import { Inbox } from "lucide-react";

type EmptyStateProps = {
  /** Short label, e.g. "No runs yet". */
  label: string;
};

/**
 * Shared empty-state rendering used by every widget when its data source
 * returns no rows. Intentionally minimal — an icon + a one-line label.
 */
export function EmptyState({ label }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        padding: "1.5rem",
        color: "var(--muted-foreground)"
      }}
    >
      <Inbox size={20} />
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}

export default EmptyState;
