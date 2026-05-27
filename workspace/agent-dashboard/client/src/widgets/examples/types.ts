/**
 * Shared types for the widget primitives.
 *
 * Each widget kind has its own binding shape — the spec generator picks
 * which columns the widget reads from. Widgets render given a `data` array
 * of rows from `result_*` tables; in preview mode the rows are synthetic.
 */

/** Single row from a `result_*` table. Keys are column names. */
export type WidgetRow = Record<string, unknown>;

export type WidgetData = ReadonlyArray<WidgetRow>;

export type CommonWidgetProps = {
  title: string;
  hint?: string;
  data: WidgetData;
  /** Label shown when `data` is empty. Defaults to "No data for <title>". */
  emptyLabel?: string;
};

export type KpiBinding = {
  /** Numeric column the KPI value comes from. */
  value: string;
  /** Optional numeric column for the delta vs previous period. */
  delta?: string;
  /** Optional numeric column the delta is normalized against ("vs Xs"). */
  /** Optional aggregator — defaults to "latest". */
  aggregator?: "latest" | "sum" | "avg" | "max" | "min";
  /** Optional unit suffix shown after the value, e.g. "%" or "s". */
  unit?: string;
  /** Optional numeric column the sparkline reads. */
  spark?: string;
};

export type LineChartBinding = {
  /** Datetime column on the X axis. */
  x: string;
  /** One or more numeric Y series. */
  y: ReadonlyArray<string>;
};

export type AreaChartBinding = LineChartBinding;

export type BarChartBinding = {
  /** Categorical X axis column. */
  x: string;
  /** Numeric Y series (one or more). */
  y: ReadonlyArray<string>;
};

export type PieChartBinding = {
  /** Low-cardinality string column for slice category. */
  category: string;
  /** Numeric column for slice value. */
  value: string;
};

export type TableBinding = {
  /** Column names rendered in order. */
  columns: ReadonlyArray<string>;
  /** Optional default sort column. */
  sort?: string;
  /** Optional max rows to render (default 20). */
  limit?: number;
};

export type StatusBadgeBinding = {
  /** Column with the status value (low-cardinality string). */
  status: string;
  /** Optional label column shown alongside. */
  label?: string;
  /** Optional time column. */
  time?: string;
};

export type ActivityFeedBinding = {
  /** Timestamp column. */
  time: string;
  /** Headline/title column for each item. */
  title: string;
  /** Optional status column for a small badge. */
  status?: string;
};

export type ButtonTriggerBinding = {
  /** Workflow id the button invokes. */
  workflow: string;
  /** Chat-message template sent when the button is clicked. */
  chat_message: string;
};

export type WidgetKind =
  | "card-kpi"
  | "chart-line"
  | "chart-area"
  | "chart-bar"
  | "chart-pie"
  | "table-data"
  | "status-badge"
  | "activity-feed"
  | "button-trigger";

export const ALL_WIDGET_KINDS: ReadonlyArray<WidgetKind> = [
  "card-kpi",
  "chart-line",
  "chart-area",
  "chart-bar",
  "chart-pie",
  "table-data",
  "status-badge",
  "activity-feed",
  "button-trigger"
];

/** Safe numeric coercion. Returns null for non-numeric values. */
export const asNumber = (value: unknown): number | null => {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

/** Format a number compactly for headline display. */
export const formatNumber = (n: number): string => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (!Number.isInteger(n) && abs < 100) return n.toFixed(2);
  return n.toLocaleString();
};
