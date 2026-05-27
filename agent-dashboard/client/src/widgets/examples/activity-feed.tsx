import EmptyState from "./empty-state";
import WidgetCard from "./widget-card";
import type { ActivityFeedBinding, CommonWidgetProps } from "./types";

type ActivityFeedProps = CommonWidgetProps & {
  binding: ActivityFeedBinding;
  /** Optional limit on items rendered (default 12). */
  limit?: number;
};

const formatTime = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "string") {
    const ts = Date.parse(value);
    if (!Number.isNaN(ts)) {
      const diffMin = Math.round((Date.now() - ts) / 60_000);
      if (diffMin < 1) return "just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.round(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDay = Math.round(diffHr / 24);
      return `${diffDay}d ago`;
    }
    return value;
  }
  return String(value);
};

/**
 * Vertical activity feed — chronological list of events from a `result_*`
 * table. Newest first. Optional status badge per item.
 */
export function ActivityFeed({
  title,
  hint,
  data,
  binding,
  limit = 12,
  emptyLabel
}: ActivityFeedProps) {
  // Sort descending by the time column, then take `limit`.
  const items = [...data]
    .sort((a, b) => {
      const aT = Date.parse(String(a[binding.time] ?? ""));
      const bT = Date.parse(String(b[binding.time] ?? ""));
      return (Number.isNaN(bT) ? 0 : bT) - (Number.isNaN(aT) ? 0 : aT);
    })
    .slice(0, limit);

  return (
    <WidgetCard title={title} hint={hint} minHeight={220}>
      {items.length === 0 ? (
        <EmptyState label={emptyLabel ?? `No activity for ${title}`} />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {items.map((row, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
                paddingBottom: "0.5rem",
                borderBottom: idx === items.length - 1 ? "none" : "1px solid var(--border)"
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  marginTop: 6,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--primary)",
                  flexShrink: 0
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--foreground)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {String(row[binding.title] ?? "—")}
                </p>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    {formatTime(row[binding.time])}
                  </span>
                  {binding.status && row[binding.status] != null && (
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      · {String(row[binding.status])}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

export default ActivityFeed;
