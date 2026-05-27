import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@ruh-ai/ruh-design-system";

import { STANDARD_RIGHT_RAIL_TOOLS, type RightRailToolId } from "@/lib/right-rail";

type RightRailProps = {
  onSelect?: (id: RightRailToolId) => void;
  /** Tool buttons that should be visually disabled (e.g., not wired in preview mode). */
  disabledTools?: ReadonlyArray<RightRailToolId>;
};

/**
 * Icon-only right rail (~80px wide) with the four standard operator tools:
 * Rebuild / Terminal / Browser / Function. Same for every agent.
 *
 * Built on Ruh DS `Button` (variant="outline" / size="icon") + `Tooltip`
 * so hover state, focus ring, and the hint tooltip match the rest of
 * the platform. Click handlers are delegated to the host so the skeleton
 * has no opinion on what each tool actually does at runtime.
 */
export function RightRail({ onSelect, disabledTools = [] }: RightRailProps) {
  return (
    <aside
      aria-label="Operator tools"
      className="flex flex-col items-center gap-2 border-l bg-card px-2 py-4"
    >
      <span
        aria-hidden="true"
        className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        Tools
      </span>
      {STANDARD_RIGHT_RAIL_TOOLS.map((tool) => {
        const Icon = tool.icon;
        const isDisabled = disabledTools.includes(tool.id);
        return (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={tool.label}
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelect?.(tool.id)}
                className="flex h-auto w-14 flex-col items-center justify-center gap-1 px-2 py-2"
              >
                <Icon size={16} />
                <span className="text-[10px] font-medium leading-none">{tool.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">{tool.hint}</TooltipContent>
          </Tooltip>
        );
      })}
    </aside>
  );
}

export default RightRail;
