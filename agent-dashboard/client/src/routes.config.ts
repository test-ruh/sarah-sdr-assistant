import { Activity, ClipboardCheck, LayoutDashboard, MessageCircle, Send, Users, type LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

import ActivityTab from "@/tabs/activity";
import CampaignsTab from "@/tabs/campaigns";
import ConversationTab from "@/tabs/conversation";
import OverviewTab from "@/tabs/overview";
import ProspectsTab from "@/tabs/prospects";
import SequenceTab from "@/tabs/sequence";

export type DashboardRoute = {
  id: string;
  label: string;
  icon?: LucideIcon;
  Component: ComponentType;
  hint?: string;
};

export const routes: DashboardRoute[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, Component: OverviewTab, hint: "Sarah campaign health, approvals, sends, replies, and metrics" },
  { id: "conversation", label: "Conversation", icon: MessageCircle, Component: ConversationTab, hint: "Start or update SDR campaigns through Sarah's guided workflow" },
  { id: "campaigns", label: "Campaigns", icon: ClipboardCheck, Component: CampaignsTab, hint: "Review stored campaign artifacts and configuration" },
  { id: "prospects", label: "Prospects", icon: Users, Component: ProspectsTab, hint: "Track prospect approvals before outreach" },
  { id: "sequence", label: "Sequence", icon: Send, Component: SequenceTab, hint: "Review generated sequence copy and scheduled follow-ups" },
  { id: "activity", label: "Activity", icon: Activity, Component: ActivityTab, hint: "Monitor Email API sends, replies, and Slack coordination" }
];

export const defaultRouteId = "overview";
