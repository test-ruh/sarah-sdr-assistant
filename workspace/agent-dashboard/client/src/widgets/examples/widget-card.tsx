import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@ruh-ai/ruh-design-system";
import type { ReactNode } from "react";

type WidgetCardProps = {
  title: string;
  /** Optional small text shown to the right of the title (period, range, etc). */
  hint?: string;
  /** Optional right-aligned slot for filter buttons, range toggles, etc. */
  actions?: ReactNode;
  /** Body content. Widget primitives render their chart/table/etc here. */
  children: ReactNode;
  /** Optional explicit min height so empty states don't collapse the grid. */
  minHeight?: number;
};

/**
 * Reusable card chrome shared by every widget primitive.
 *
 * Built on `@ruh-ai/ruh-design-system` Card + CardHeader + CardTitle +
 * CardContent so every widget inherits the platform's surface, border,
 * radius, padding, and shadow tokens. Local props (title / hint / actions
 * / children / minHeight) stay stable so the 9 widget primitives don't
 * need to change shape.
 *
 * Title is rendered in uppercase tracker-style for the dashboard look;
 * `hint` rides next to the title as a small muted suffix; `actions`
 * lands in CardAction (DS's pre-wired top-right slot).
 */
export function WidgetCard({
  title,
  hint,
  actions,
  children,
  minHeight = 160
}: WidgetCardProps) {
  return (
    <Card size="sm" style={{ minHeight }}>
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="truncate">{title}</span>
          {hint && <span className="text-[11px] font-normal normal-case tracking-normal text-muted-foreground/80">{hint}</span>}
        </CardTitle>
        {actions && <CardAction>{actions}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center">
        {children}
      </CardContent>
    </Card>
  );
}

export default WidgetCard;
