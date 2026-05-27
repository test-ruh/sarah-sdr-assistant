import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import EmptyState from "./empty-state";
import WidgetCard from "./widget-card";
import {
  asNumber,
  type BarChartBinding,
  type CommonWidgetProps
} from "./types";

type ChartBarProps = CommonWidgetProps & {
  binding: BarChartBinding;
};

const SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)"
];

const seriesColor = (index: number): string => SERIES_COLORS[index % SERIES_COLORS.length] || "var(--primary)";

/**
 * Bar chart — categorical X axis, one or more numeric Y series.
 *
 * Useful for distribution-by-category or comparing series across discrete
 * buckets. Series stack would be an opt-in flag in the future.
 */
export function ChartBar({ title, hint, data, binding, emptyLabel }: ChartBarProps) {
  const hasData = data.some((row) => binding.y.some((col) => asNumber(row[col]) !== null));

  return (
    <WidgetCard title={title} hint={hint} minHeight={260}>
      {!hasData ? (
        <EmptyState label={emptyLabel ?? `No data for ${title}`} />
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as Array<Record<string, unknown>>}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey={binding.x} tickLine={false} fontSize={11} stroke="var(--muted-foreground)" />
              <YAxis tickLine={false} fontSize={11} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
              {binding.y.map((column, idx) => (
                <Bar key={column} dataKey={column} fill={seriesColor(idx)} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  );
}

export default ChartBar;
