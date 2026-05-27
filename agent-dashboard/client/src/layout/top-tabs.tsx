import {
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@ruh-ai/ruh-design-system";

import { routes } from "@/routes.config";
import type { TabId } from "@/lib/tabs";

type TopTabsProps = {
  active: TabId;
  onSelect: (id: TabId) => void;
};

/**
 * Top-tab bar.
 *
 * Renders the tabs declared in `routes.config.ts`. The set is fully
 * agent-driven — the platform doesn't enforce a count or names beyond
 * the convention that one route MUST have id="overview" (enforced by
 * the tester).
 *
 * Built on Ruh DS `Tabs` + `TabsList` + `TabsTrigger` + `Tooltip` so
 * active state, focus ring, and motion match the rest of the platform.
 */
export function TopTabs({ active, onSelect }: TopTabsProps) {
  return (
    <Tabs
      value={active}
      onValueChange={(value) => onSelect(value)}
      className="border-b px-6"
    >
      <TabsList aria-label="Dashboard sections" className="bg-transparent p-0">
        {routes.map((route) => {
          const Icon = route.icon;
          return (
            <Tooltip key={route.id}>
              <TooltipTrigger asChild>
                <TabsTrigger value={route.id} className="gap-1.5">
                  {Icon && <Icon size={14} />}
                  {route.label}
                </TabsTrigger>
              </TooltipTrigger>
              {route.hint && <TooltipContent side="bottom">{route.hint}</TooltipContent>}
            </Tooltip>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

export default TopTabs;
