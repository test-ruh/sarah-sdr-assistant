import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@ruh-ai/ruh-design-system";

import type { SidebarItem } from "@/lib/sidebar";

type SidebarProps = {
  /** Currently active item id (typically matches the active tab id). */
  active: string;
  /** Items to render — derived from the agent's routes plus optional additions. */
  items: ReadonlyArray<SidebarItem>;
  /** Fired when the operator clicks an item. */
  onSelect: (id: string) => void;
};

/**
 * Icon-only left sidebar (80px wide).
 *
 * v1.5 (AB-404 follow-up): the sidebar reflects the agent's own surfaces
 * rather than a fixed platform-wide eight-item set. `items` comes from
 * `routes.config.ts` (one icon per tab) plus optional agent-declared
 * additions.
 *
 * Built on `@ruh-ai/ruh-design-system` `Button` (variant="ghost" /
 * size="icon") + `Tooltip` so hover state, focus ring, and the hint
 * tooltip match the rest of the platform. The active item uses
 * variant="secondary" to read as a selected pill.
 *
 * Per AB-370 / the wireframe, the agent's display label is intentionally
 * NOT shown in the sidebar — the label belongs on the identity card in
 * the header.
 */
export function Sidebar({ active, items, onSelect }: SidebarProps) {
  return (
    <nav
      aria-label="Agent dashboard primary navigation"
      className="flex flex-col items-center gap-2 border-r bg-card py-4"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === active;
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="icon"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelect(item.id)}
              >
                <Icon size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.hint ?? item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}

export default Sidebar;
