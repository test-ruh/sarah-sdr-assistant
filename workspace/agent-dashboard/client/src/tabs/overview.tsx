import { useQuery } from "@tanstack/react-query";
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress, Separator } from "@ruh-ai/ruh-design-system";
import { CheckCircle2, Clock3, MailCheck, MessageSquareWarning, type LucideIcon } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type {
  ResultCampaigns,
  ResultOutboundSends,
  ResultProspects,
  ResultReplies,
  ResultScheduledActions
} from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
const stubCampaigns: ResultCampaigns[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    name: "Mid-market RevOps directors",
    status: "sequence_ready",
    owner_context: { owner: "Sales Ops", channel: "dashboard", last_operator_message: "Prioritize RevOps teams replacing spreadsheet handoffs." },
    configuration: { icp: "B2B SaaS, 200-1200 employees", timing: "Tue and Thu mornings UTC", sequence: "3 touches over 9 business days", approvals: "prospects and sends" },
    created_at: "2026-05-24T09:00:00Z",
    updated_at: "2026-05-27T14:00:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "11111111-1111-4111-8111-111111111112",
    run_id: "dashboard-conversation-11111111-1111-4111-8111-111111111112",
    computed_at: "2026-05-27T15:10:00Z",
    name: "Healthcare finance leaders",
    status: "pending_runtime_validation",
    owner_context: { owner: "SDR Team", channel: "dashboard", handoff: "result_table_pending_artifact" },
    configuration: { source: "dashboard_conversation", handoff_status: "pending_runtime_validation", brief: "Validate ICP and ask for compliance constraints before prospect retrieval." },
    created_at: "2026-05-27T15:10:00Z",
    updated_at: "2026-05-27T15:10:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  }
];

// Stub data — preview fallback + cold-start initial render.
const stubProspects: ResultProspects[] = [
  {
    id: "22222222-2222-4222-8222-222222222220",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    email: "maya.chen@northstar.io",
    name: "Maya Chen",
    company: "Northstar Systems",
    profile: { title: "VP Revenue Operations", fit: "High", source: "platform prospect database" },
    approval_status: "approved",
    created_at: "2026-05-25T10:00:00Z",
    updated_at: "2026-05-27T13:00:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "22222222-2222-4222-8222-222222222221",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    email: "jordan.patel@clearpath.ai",
    name: "Jordan Patel",
    company: "ClearPath AI",
    profile: { title: "Director of RevOps", fit: "High", source: "platform prospect database" },
    approval_status: "approved",
    created_at: "2026-05-25T10:03:00Z",
    updated_at: "2026-05-27T13:05:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    email: "priya.raman@orbitops.com",
    name: "Priya Raman",
    company: "OrbitOps",
    profile: { title: "Head of Revenue Systems", fit: "Medium", source: "platform prospect database" },
    approval_status: "pending_review",
    created_at: "2026-05-25T10:05:00Z",
    updated_at: "2026-05-27T13:10:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "22222222-2222-4222-8222-222222222223",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    email: "daniel.brooks@scalegrid.co",
    name: "Daniel Brooks",
    company: "ScaleGrid",
    profile: { title: "Revenue Operations Lead", fit: "High", source: "platform prospect database" },
    approval_status: "approved",
    created_at: "2026-05-25T10:08:00Z",
    updated_at: "2026-05-27T13:12:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "22222222-2222-4222-8222-222222222224",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    email: "sofia.martin@cloudforge.dev",
    name: "Sofia Martin",
    company: "CloudForge",
    profile: { title: "Chief Revenue Officer", fit: "High", source: "platform prospect database" },
    approval_status: "approved",
    created_at: "2026-05-25T10:12:00Z",
    updated_at: "2026-05-27T13:18:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "22222222-2222-4222-8222-222222222225",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    email: "lee.hart@draftbit.com",
    name: "Lee Hart",
    company: "Draftbit",
    profile: { title: "Founder", fit: "Low", source: "platform prospect database" },
    approval_status: "rejected",
    created_at: "2026-05-25T10:16:00Z",
    updated_at: "2026-05-27T13:20:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  }
];

// Stub data — preview fallback + cold-start initial render.
const stubScheduledActions: ResultScheduledActions[] = [
  {
    id: "33333333-3333-4333-8333-333333333330",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    prospect_id: "22222222-2222-4222-8222-222222222220",
    sequence_id: "44444444-4444-4444-8444-444444444440",
    action_type: "sequence_send",
    scheduled_at: "2026-05-28T09:30:00Z",
    status: "scheduled",
    created_at: "2026-05-27T12:00:00Z",
    updated_at: "2026-05-27T12:30:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "33333333-3333-4333-8333-333333333331",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    prospect_id: "22222222-2222-4222-8222-222222222221",
    sequence_id: "44444444-4444-4444-8444-444444444441",
    action_type: "follow_up",
    scheduled_at: "2026-06-02T09:30:00Z",
    status: "scheduled",
    created_at: "2026-05-27T12:04:00Z",
    updated_at: "2026-05-27T12:31:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "33333333-3333-4333-8333-333333333332",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    prospect_id: "22222222-2222-4222-8222-222222222223",
    sequence_id: "44444444-4444-4444-8444-444444444442",
    action_type: "follow_up",
    scheduled_at: "2026-06-06T09:30:00Z",
    status: "draft_pending_approval",
    created_at: "2026-05-27T12:08:00Z",
    updated_at: "2026-05-27T12:32:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  }
];

// Stub data — preview fallback + cold-start initial render.
const stubOutboundSends: ResultOutboundSends[] = [
  {
    id: "55555555-5555-4555-8555-555555555550",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    prospect_id: "22222222-2222-4222-8222-222222222220",
    sequence_id: "44444444-4444-4444-8444-444444444440",
    scheduled_action_id: "33333333-3333-4333-8333-333333333330",
    email_api_message_id: "emailapi_msg_4810",
    send_status: "delivered",
    sent_at: "2026-05-27T10:15:00Z",
    metadata: { provider: "Email API", slack_notice: true },
    created_at: "2026-05-27T10:00:00Z",
    updated_at: "2026-05-27T12:00:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "55555555-5555-4555-8555-555555555551",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    prospect_id: "22222222-2222-4222-8222-222222222221",
    sequence_id: "44444444-4444-4444-8444-444444444441",
    scheduled_action_id: "33333333-3333-4333-8333-333333333331",
    email_api_message_id: "emailapi_msg_4811",
    send_status: "sent",
    sent_at: "2026-05-27T11:15:00Z",
    metadata: { provider: "Email API", slack_notice: false },
    created_at: "2026-05-27T10:02:00Z",
    updated_at: "2026-05-27T12:02:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "55555555-5555-4555-8555-555555555552",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    prospect_id: "22222222-2222-4222-8222-222222222224",
    sequence_id: "44444444-4444-4444-8444-444444444442",
    scheduled_action_id: null,
    email_api_message_id: "emailapi_msg_4812",
    send_status: "queued",
    sent_at: null,
    metadata: { provider: "Email API", queued_reason: "waiting_for_schedule" },
    created_at: "2026-05-27T10:04:00Z",
    updated_at: "2026-05-27T12:04:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  }
];

// Stub data — preview fallback + cold-start initial render.
const stubReplies: ResultReplies[] = [
  {
    id: "66666666-6666-4666-8666-666666666660",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    prospect_id: "22222222-2222-4222-8222-222222222220",
    outbound_send_id: "55555555-5555-4555-8555-555555555550",
    email_api_reply_id: "reply_9001",
    reply_body: "Interested, can you send a short overview before Friday?",
    received_at: "2026-05-27T13:20:00Z",
    review_status: "needs_review",
    created_at: "2026-05-27T13:21:00Z",
    updated_at: "2026-05-27T13:21:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "66666666-6666-4666-8666-666666666661",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    prospect_id: "22222222-2222-4222-8222-222222222221",
    outbound_send_id: "55555555-5555-4555-8555-555555555551",
    email_api_reply_id: "reply_9002",
    reply_body: "Loop in our RevOps manager next week.",
    received_at: "2026-05-27T13:45:00Z",
    review_status: "triaged",
    created_at: "2026-05-27T13:46:00Z",
    updated_at: "2026-05-27T13:46:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  }
];

type OverviewPayload = {
  campaigns: ResultCampaigns[];
  prospects: ResultProspects[];
  scheduled: ResultScheduledActions[];
  sends: ResultOutboundSends[];
  replies: ResultReplies[];
};

const stubOverview: OverviewPayload = {
  campaigns: stubCampaigns,
  prospects: stubProspects,
  scheduled: stubScheduledActions,
  sends: stubOutboundSends,
  replies: stubReplies
};

const formatDateTime = (value: string | null) =>
  value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(value)) + " UTC" : "not scheduled";

const statusText = (value: string | null) => value?.replace(/_/g, " ") ?? "unknown";

export default function OverviewTab() {
  const { data = stubOverview } = useQuery<OverviewPayload>({
    queryKey: ["sdr-overview"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/overview`).then((response) => response.json()),
    placeholderData: stubOverview,
    enabled: !!apiBaseUrl
  });

  const activeCampaign = data.campaigns[0];
  const approvedProspects = data.prospects.filter((prospect) => prospect.approval_status === "approved").length;
  const pendingProspects = data.prospects.filter((prospect) => prospect.approval_status === "pending_review").length;
  const completedSends = data.sends.filter((send) => ["sent", "delivered"].includes(send.send_status ?? "")).length;
  const repliesNeedingReview = data.replies.filter((reply) => reply.review_status !== "reviewed").length;
  const nextActions = data.scheduled.filter((item) => item.status !== "sent").slice(0, 3);
  const approvalProgress = Math.round((approvedProspects / Math.max(data.prospects.length, 1)) * 100);

  return (
    <section className="space-y-5 p-6">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">Sarah SDR command center</h1>
          <Badge variant="secondary">Approval-aware outreach</Badge>
        </div>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Monitor campaign artifacts, prospect approvals, sequence timing, Email API sends, and reply review before Sarah advances the SDR workflow.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric icon={CheckCircle2} label="Active campaigns" value={data.campaigns.length.toString()} detail="stored campaign artifacts" />
        <Metric icon={CheckCircle2} label="Approved prospects" value={approvedProspects.toString()} detail={`${pendingProspects} awaiting approval`} />
        <Metric icon={MailCheck} label="Emails sent" value={completedSends.toString()} detail="Email API tracked" />
        <Metric icon={MessageSquareWarning} label="Replies to review" value={repliesNeedingReview.toString()} detail="Slack coordination ready" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>{activeCampaign?.name ?? "No campaign artifact yet"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{statusText(activeCampaign?.status ?? null)}</Badge>
              <Badge variant="secondary">Dashboard + Slack setup</Badge>
              <Badge variant="secondary">Prospect approval gate</Badge>
              <Badge variant="secondary">Email API replies</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Prospect approval progress</span>
                <span className="text-muted-foreground">{approvedProspects} of {data.prospects.length}</span>
              </div>
              <Progress value={approvalProgress} />
            </div>
            <Separator />
            <div className="grid gap-3 md:grid-cols-3">
              {nextActions.map((item) => (
                <div key={item.id} className="rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock3 className="h-4 w-4 text-primary" />
                    {statusText(item.action_type)}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(item.scheduled_at)}</p>
                  <Badge variant="secondary" className="mt-3">{statusText(item.status)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs human attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AttentionRow label="Prospect-list changes" count={pendingProspects} detail="held until approval" />
            <AttentionRow label="Sequence drafts" count={data.scheduled.filter((item) => item.status === "draft_pending_approval").length} detail="review before scheduling" />
            <AttentionRow label="Email replies" count={repliesNeedingReview} detail="review and coordinate next step" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AttentionRow({ label, count, detail }: { label: string; count: number; detail: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <Badge variant={count > 0 ? "default" : "secondary"}>{count}</Badge>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
