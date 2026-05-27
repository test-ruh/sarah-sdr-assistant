import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import EmptyState from "./empty-state";
import WidgetCard from "./widget-card";
import {
  asNumber,
  type CommonWidgetProps,
  type PieChartBinding
} from "./types";

type ChartPieProps = CommonWidgetProps & {
  binding: PieChartBinding;
};

const SLICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)"
];

const sliceColor = (index: number): string => SLICE_COLORS[index % SLICE_COLORS.length] || "var(--primary)";

/**
 * Pie chart — distribution of a numeric value across low-cardinality
 * categories. Per AB-370 quality bar rule #4 the category column must be
 * a low-cardinality string in the schema.
 */
export function ChartPie({ title, hint, data, binding, emptyLabel }: ChartPieProps) {
  // Aggregate rows by category, summing the value column.
  const buckets = new Map<string, number>();
  for (const row of data) {
    const cat = String(row[binding.category] ?? "");
    const val = asNumber(row[binding.value]);
    if (!cat || val == null) continue;
    buckets.set(cat, (buckets.get(cat) ?? 0) + val);
  }
  const slices = Array.from(buckets.entries()).map(([name, value]) => ({ name, value }));

  return (
    <WidgetCard title={title} hint={hint} minHeight={260}>
      {slices.length === 0 ? (
        <EmptyState label={emptyLabel ?? `No data for ${title}`} />
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {slices.map((slice, idx) => (
                  <Cell key={slice.name} fill={sliceColor(idx)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  );
}

export default ChartPie;
