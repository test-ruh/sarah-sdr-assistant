import type { LucideIcon } from "lucide-react";

/**
 * Sidebar items shown in the icon-only left strip.
 *
 * In v1.5 (AB-404 follow-up), the sidebar derives from the agent's own
 * surfaces — one entry per route declared in `routes.config.ts`, plus
 * optional agent-declared additions appended after a separator.
 *
 * The pre-AB-404 model shipped a fixed eight-item platform sidebar
 * (Mission Control / Session / Skills / Agents / Workflow / Knowledge /
 * API Keys / Marketplace) on every dashboard. Those items were
 * platform-wide navigation that didn't belong on a per-agent operator
 * surface — they made every dashboard feel like a generic template.
 * The sidebar now reflects what THIS agent actually has.
 */

export type SidebarItem = {
  /** Stable id (matches the tab id when the item comes from a route). */
  id: string;
  /** Display label, shown in the tooltip. */
  label: string;
  /** Lucide icon rendered in the strip. */
  icon: LucideIcon;
  /** Hover description surfaced on the icon-only sidebar. */
  hint?: string;
};
