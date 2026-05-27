/**
 * Example widget primitives bundled with the agent-dashboard skeleton.
 *
 * These are NOT a fixed palette — they're a starting library the
 * agent-dashboard-builder subagent can import OR ignore. Every example
 * is built on Ruh DS primitives + recharts + lucide so consuming or
 * extending them stays on-brand.
 *
 * Agents free to import what's useful:
 *
 *   import { CardKpi, ChartLine, WidgetCard } from "@/widgets/examples";
 *
 * …and equally free to write fresh components in their own tab files
 * when the agent's domain doesn't fit (Instagram feeds, calendar grids,
 * PR queues, etc.). The platform constraint is "use the Design System",
 * not "use these specific widgets".
 */

export { default as ActivityFeed } from "./activity-feed";
export { default as ButtonTrigger } from "./button-trigger";
export { default as CardKpi } from "./card-kpi";
export { ChartArea, default as ChartLine } from "./chart-line";
export { default as ChartBar } from "./chart-bar";
export { default as ChartPie } from "./chart-pie";
export { default as StatusBadge } from "./status-badge";
export { default as TableData } from "./table-data";

export { default as EmptyState } from "./empty-state";
export { default as WidgetCard } from "./widget-card";

export * from "./types";
