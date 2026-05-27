import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import EmptyState from "./empty-state";
import WidgetCard from "./widget-card";
import {
  asNumber,
  formatNumber,
  type CommonWidgetProps,
  type KpiBinding
} from "./types";

type CardKpiProps = CommonWidgetProps & {
  binding: KpiBinding;
};

const aggregate = (
  rows: ReadonlyArray<Record<string, unknown>>,
  column: string,
  aggregator: NonNullable<KpiBinding["aggregator"]>
): number | null => {
  const values = rows
    .map((row) => asNumber(row[column]))
    .filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  switch (aggregator) {
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "max":
      return Math.max(...values);
    case "min":
      return Math.min(...values);
    case "latest":
    default:
      return values[values.length - 1] ?? null;
  }
};

/** Inline SVG sparkline — no charting library needed for the KPI strip. */
function Sparkline({ values }: { values: ReadonlyArray<number> }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const stepX = w / (values.length - 1);
  const points = values
    .map((value, idx) => {
      const x = idx * stepX;
      const y = h - ((value - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * KPI card — single headline number with optional delta + sparkline.
 *
 * Per AB-370 dashboard quality bar rule #3, KPIs must bind to numeric
 * columns. Renderer/tester rejects non-numeric bindings before this widget
 * ever sees them.
 */
export function CardKpi({ title, hint, data, binding, emptyLabel }: CardKpiProps) {
  const value = aggregate(data, binding.value, binding.aggregator ?? "latest");
  const delta =
    binding.delta != null ? aggregate(data, binding.delta, binding.aggregator ?? "latest") : null;
  const sparkValues =
    binding.spark != null
      ? data
          .map((row) => asNumber(row[binding.spark!]))
          .filter((v): v is number => v !== null)
      : [];

  return (
    <WidgetCard title={title} hint={hint} minHeight={140}>
      {value == null ? (
        <EmptyState label={emptyLabel ?? `No data for ${title}`} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
            <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>
              {formatNumber(value)}
            </span>
            {binding.unit && (
              <span style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                {binding.unit}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {delta != null ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  fontSize: 12,
                  color: delta >= 0 ? "var(--primary)" : "var(--destructive)"
                }}
              >
                {delta >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {formatNumber(Math.abs(delta))}
                {binding.unit ?? ""}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>—</span>
            )}
            <Sparkline values={sparkValues} />
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

export default CardKpi;
