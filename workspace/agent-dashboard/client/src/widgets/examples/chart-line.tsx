import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import EmptyState from "./empty-state";
import WidgetCard from "./widget-card";
import {
  asNumber,
  type CommonWidgetProps,
  type LineChartBinding
} from "./types";

type ChartLineProps = CommonWidgetProps & {
  binding: LineChartBinding;
  /** When true, render filled area underneath each line. */
  filled?: boolean;
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
 * Line or area timeseries chart.
 *
 * Per AB-370 dashboard quality bar rule #4, the `x` column must be a
 * datetime in the schema; the renderer/tester rejects bindings otherwise.
 * Renders one series per entry in `binding.y`.
 */
export function ChartLine({ title, hint, data, binding, filled, emptyLabel }: ChartLineProps) {
  const series = binding.y.map((column) => ({
    column,
    points: data
      .map((row) => ({ x: row[binding.x] as string | number, y: asNumber(row[column]) }))
      .filter((pt): pt is { x: string | number; y: number } => pt.y !== null)
  }));

  const totalPoints = series.reduce((acc, s) => acc + s.points.length, 0);

  return (
    <WidgetCard title={title} hint={hint} minHeight={260}>
      {totalPoints === 0 ? (
        <EmptyState label={emptyLabel ?? `No data for ${title}`} />
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            {filled ? (
              <AreaChart data={data as Array<Record<string, unknown>>}>
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
                  <Area
                    key={column}
                    type="monotone"
                    dataKey={column}
                    stroke={seriesColor(idx)}
                    fill={seriesColor(idx)}
                    fillOpacity={0.15}
                    strokeWidth={1.75}
                    dot={false}
                  />
                ))}
              </AreaChart>
            ) : (
              <LineChart data={data as Array<Record<string, unknown>>}>
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
                  <Line
                    key={column}
                    type="monotone"
                    dataKey={column}
                    stroke={seriesColor(idx)}
                    strokeWidth={1.75}
                    dot={false}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  );
}

export function ChartArea(props: ChartLineProps) {
  return <ChartLine {...props} filled />;
}

export default ChartLine;
