import type { LucideIcon } from "lucide-react";
import { Globe, RefreshCw, Square, Terminal } from "lucide-react";

/**
 * The four standard right-rail operator tools.
 *
 * Same for every agent. Wiring (what each button actually does) is owned by
 * the host application; the skeleton just renders the buttons and forwards
 * click intents up through a callback.
 */

export type RightRailToolId = "rebuild" | "terminal" | "browser" | "function";

export type RightRailTool = {
  id: RightRailToolId;
  label: string;
  icon: LucideIcon;
  hint: string;
};

export const STANDARD_RIGHT_RAIL_TOOLS: readonly RightRailTool[] = [
  {
    id: "rebuild",
    label: "Rebuild",
    icon: RefreshCw,
    hint: "Re-deploy this agent to its VM."
  },
  {
    id: "terminal",
    label: "Terminal",
    icon: Terminal,
    hint: "SSH into the agent's runtime."
  },
  {
    id: "browser",
    label: "Browser",
    icon: Globe,
    hint: "Open the agent's outbound browser session."
  },
  {
    id: "function",
    label: "Function",
    icon: Square,
    hint: "Invoke a custom maintenance function on this agent."
  }
] as const;
