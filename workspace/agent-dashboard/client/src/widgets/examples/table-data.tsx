import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@ruh-ai/ruh-design-system";

import EmptyState from "./empty-state";
import WidgetCard from "./widget-card";
import { asNumber, type CommonWidgetProps, type TableBinding } from "./types";

type TableDataProps = CommonWidgetProps & {
  binding: TableBinding;
};

const formatCell = (value: unknown): string => {
  if (value == null) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (value instanceof Date) return value.toLocaleString();
  return JSON.stringify(value);
};

/**
 * Table view of `result_*` rows.
 *
 * Built on Ruh DS `Table` + `TableHeader` + `TableHead` + `TableBody` +
 * `TableRow` + `TableCell` so spacing, divider rules, hover state, and
 * dark-mode tokens come from the platform.
 *
 * Renders the columns named in `binding.columns` in order, sorted by
 * `binding.sort` if provided. Capped at `binding.limit` (default 20)
 * so the dashboard never tries to render thousands of rows.
 */
export function TableData({ title, hint, data, binding, emptyLabel }: TableDataProps) {
  const limit = binding.limit ?? 20;
  let rows = data;
  if (binding.sort) {
    const sortKey = binding.sort;
    rows = [...rows].sort((a, b) => {
      const aValue = asNumber(a[sortKey]);
      const bValue = asNumber(b[sortKey]);
      if (aValue != null && bValue != null) return bValue - aValue;
      return String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""));
    });
  }
  rows = rows.slice(0, limit);

  return (
    <WidgetCard title={title} hint={hint} minHeight={220}>
      {rows.length === 0 ? (
        <EmptyState label={emptyLabel ?? `No rows for ${title}`} />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {binding.columns.map((column) => (
                  <TableHead
                    key={column}
                    className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  {binding.columns.map((column) => (
                    <TableCell
                      key={column}
                      className="max-w-[260px] truncate whitespace-nowrap text-sm"
                    >
                      {formatCell(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </WidgetCard>
  );
}

export default TableData;
