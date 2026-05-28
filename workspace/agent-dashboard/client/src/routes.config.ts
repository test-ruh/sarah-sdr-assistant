import { BotMessageSquare, FileText, LayoutDashboard, MailCheck, Send, Users, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

import OverviewTab from "@/tabs/overview";
import ConversationTab from "@/tabs/conversation";
import CampaignsTab from "@/tabs/campaigns";
import ProspectsTab from "@/tabs/prospects";
import SequenceTab from "@/tabs/sequence";
import ActivityTab from "@/tabs/activity";

export type DashboardRoute = {
  id: string;
  label: string;
  icon?: LucideIcon;
  Component: ComponentType;
  hint?: string;
};

export const routes: DashboardRoute[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    Component: OverviewTab,
    hint: "Sarah SDR campaign health and approval readiness"
  },
  {
    id: "conversation",
    label: "Conversation",
    icon: BotMessageSquare,
    Component: ConversationTab,
    hint: "Start or update campaign setup through Sarah"
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: FileText,
    Component: CampaignsTab,
    hint: "Review stored campaign artifacts and configuration"
  },
  {
    id: "prospects",
    label: "Prospects",
    icon: Users,
    Component: ProspectsTab,
    hint: "Track prospect approvals before outreach"
  },
  {
    id: "sequence",
    label: "Sequence",
    icon: Send,
    Component: SequenceTab,
    hint: "Sequence content, timing, and scheduled sends"
  },
  {
    id: "activity",
    label: "Activity",
    icon: MailCheck,
    Component: ActivityTab,
    hint: "Email API sends, replies, and coordination signals"
  }
];

export const defaultRouteId = "overview";
