import { Card, CardContent, CardHeader, CardTitle, Badge, Progress, Separator } from "@ruh-ai/ruh-design-system";
import { useQuery } from "@tanstack/react-query";
import { Activity, CheckCircle2, Mail, MessageSquareReply, Target, Users } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultCampaigns, ResultEmailSequences, ResultIcpCriteria, ResultOutboundSends, ResultProspects, ResultReplies, ResultScheduledActions } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
// Reflects what `result_campaigns` would look like after active SDR campaign setup.
const stubCampaigns: ResultCampaigns[] = [
  { id: "11111111-1111-4111-8111-111111111111", run_id: "run-sdr-01", computed_at: "2026-05-27T09:00:00Z", name: "Fintech RevOps directors", status: "prospect_approval", owner_context: { team: "Growth", channel: "dashboard" }, configuration: { goal: "Book discovery calls", timing: "Day 1, Day 4, Day 9", icp: "US fintech RevOps teams, 80-600 employees" }, created_at: "2026-05-24T15:00:00Z", updated_at: "2026-05-27T09:00:00Z", org_id: null, agent_id: "sarah" },
  { id: "22222222-2222-4222-8222-222222222222", run_id: "run-sdr-02", computed_at: "2026-05-27T08:20:00Z", name: "Healthcare analytics pilots", status: "sequence_ready", owner_context: { team: "Enterprise", channel: "Slack" }, configuration: { goal: "Pilot conversations", timing: "Tuesday and Friday mornings", icp: "Healthcare analytics leaders" }, created_at: "2026-05-20T12:00:00Z", updated_at: "2026-05-27T08:20:00Z", org_id: null, agent_id: "sarah" }
];

// Stub data — preview fallback + cold-start initial render.
// Reflects current validation records from `result_icp_criteria`.
const stubIcpCriteria: ResultIcpCriteria[] = [
  { id: "33333333-3333-4333-8333-333333333333", run_id: "run-sdr-01", computed_at: "2026-05-27T09:02:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", criteria: { industries: ["fintech"], roles: ["RevOps", "VP Sales"], size: "80-600 employees" }, validation_status: "valid", created_at: "2026-05-24T15:10:00Z", updated_at: "2026-05-27T09:02:00Z", org_id: null, agent_id: "sarah" }
];

// Stub data — preview fallback + cold-start initial render.
// Reflects approved and pending records from `result_prospects`.
const stubProspects: ResultProspects[] = [
  { id: "44444444-4444-4444-8444-444444444441", run_id: "run-sdr-01", computed_at: "2026-05-27T09:10:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", email: "maya.chen@ledgerlane.example", name: "Maya Chen", company: "LedgerLane", profile: { title: "Director of RevOps", fit: "High" }, approval_status: "approved", created_at: "2026-05-25T10:00:00Z", updated_at: "2026-05-27T09:10:00Z", org_id: null, agent_id: "sarah" },
  { id: "44444444-4444-4444-8444-444444444442", run_id: "run-sdr-01", computed_at: "2026-05-27T09:10:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", email: "omar.patel@paynorth.example", name: "Omar Patel", company: "PayNorth", profile: { title: "VP Sales", fit: "Medium" }, approval_status: "pending_approval", created_at: "2026-05-25T10:05:00Z", updated_at: "2026-05-27T09:10:00Z", org_id: null, agent_id: "sarah" }
];

// Stub data — preview fallback + cold-start initial render.
// Reflects generated rows from `result_email_sequences`.
const stubEmailSequences: ResultEmailSequences[] = [
  { id: "55555555-5555-4555-8555-555555555551", run_id: "run-sdr-01", computed_at: "2026-05-27T09:20:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", step_number: 1, subject: "Reducing RevOps handoffs at fintech teams", body: "Concise opener tied to RevOps reporting delays.", timing: { offset_days: 0, window: "09:00-11:00 UTC" }, approval_status: "approved", created_at: "2026-05-26T11:00:00Z", updated_at: "2026-05-27T09:20:00Z", org_id: null, agent_id: "sarah" },
  { id: "55555555-5555-4555-8555-555555555552", run_id: "run-sdr-01", computed_at: "2026-05-27T09:20:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", step_number: 2, subject: "Following up with a quick RevOps benchmark", body: "Follow-up with approval-aware CTA.", timing: { offset_days: 4, window: "14:00-16:00 UTC" }, approval_status: "needs_review", created_at: "2026-05-26T11:05:00Z", updated_at: "2026-05-27T09:20:00Z", org_id: null, agent_id: "sarah" }
];

// Stub data — preview fallback + cold-start initial render.
// Reflects scheduled sends and follow-ups from `result_scheduled_actions`.
const stubScheduledActions: ResultScheduledActions[] = [
  { id: "66666666-6666-4666-8666-666666666661", run_id: "run-sdr-01", computed_at: "2026-05-27T09:30:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", prospect_id: "44444444-4444-4444-8444-444444444441", sequence_id: "55555555-5555-4555-8555-555555555551", action_type: "sequence_send", scheduled_at: "2026-05-28T09:30:00Z", status: "scheduled", created_at: "2026-05-27T09:30:00Z", updated_at: "2026-05-27T09:30:00Z", org_id: null, agent_id: "sarah" },
  { id: "66666666-6666-4666-8666-666666666662", run_id: "run-sdr-01", computed_at: "2026-05-27T09:35:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", prospect_id: "44444444-4444-4444-8444-444444444441", sequence_id: "55555555-5555-4555-8555-555555555552", action_type: "follow_up", scheduled_at: "2026-06-01T14:00:00Z", status: "awaiting_sequence_approval", created_at: "2026-05-27T09:35:00Z", updated_at: "2026-05-27T09:35:00Z", org_id: null, agent_id: "sarah" }
];

// Stub data — preview fallback + cold-start initial render.
// Reflects Email API send tracking from `result_outbound_sends`.
const stubOutboundSends: ResultOutboundSends[] = [
  { id: "77777777-7777-4777-8777-777777777771", run_id: "run-sdr-02", computed_at: "2026-05-27T08:00:00Z", campaign_id: "22222222-2222-4222-8222-222222222222", prospect_id: "44444444-4444-4444-8444-444444444441", sequence_id: "55555555-5555-4555-8555-555555555551", scheduled_action_id: "66666666-6666-4666-8666-666666666661", email_api_message_id: "em_8F2K", send_status: "sent", sent_at: "2026-05-27T08:00:00Z", metadata: { provider: "Email API", event: "accepted" }, created_at: "2026-05-27T08:00:00Z", updated_at: "2026-05-27T08:01:00Z", org_id: null, agent_id: "sarah" }
];

// Stub data — preview fallback + cold-start initial render.
// Reflects captured reply records from `result_replies`.
const stubReplies: ResultReplies[] = [
  { id: "88888888-8888-4888-8888-888888888881", run_id: "run-sdr-02", computed_at: "2026-05-27T09:45:00Z", campaign_id: "22222222-2222-4222-8222-222222222222", prospect_id: "44444444-4444-4444-8444-444444444441", outbound_send_id: "77777777-7777-4777-8777-777777777771", email_api_reply_id: "reply_K31", reply_body: "Happy to look next week if you can share the RevOps benchmark.", received_at: "2026-05-27T09:42:00Z", review_status: "needs_review", created_at: "2026-05-27T09:45:00Z", updated_at: "2026-05-27T09:45:00Z", org_id: null, agent_id: "sarah" }
];

type OverviewPayload = { campaigns: ResultCampaigns[]; prospects: ResultProspects[]; sequences: ResultEmailSequences[]; scheduledActions: ResultScheduledActions[]; outboundSends: ResultOutboundSends[]; replies: ResultReplies[]; icpCriteria: ResultIcpCriteria[] };
const stubOverview: OverviewPayload = { campaigns: stubCampaigns, prospects: stubProspects, sequences: stubEmailSequences, scheduledActions: stubScheduledActions, outboundSends: stubOutboundSends, replies: stubReplies, icpCriteria: stubIcpCriteria };

function statusTone(status: string | null | undefined) {
  if (!status) return "secondary";
  if (status.includes("approved") || status === "sent" || status === "valid") return "default";
  if (status.includes("review") || status.includes("approval")) return "secondary";
  return "outline";
}

export function OverviewTab() {
  const { data = stubOverview } = useQuery<OverviewPayload>({
    queryKey: ["sdr-overview"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/overview`).then((r) => r.json()),
    placeholderData: stubOverview,
    enabled: !!apiBaseUrl
  });

  const approvedProspects = data.prospects.filter((p) => p.approval_status === "approved").length;
  const replyRate = data.outboundSends.length ? Math.round((data.replies.length / data.outboundSends.length) * 100) : 0;
  const nextAction = [...data.scheduledActions].sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)))[0];
  const activeCampaign = data.campaigns[0];

  return (
    <section className="space-y-5 p-6" aria-label="Sarah SDR overview">
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Target size={16} /> Active campaigns</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{data.campaigns.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users size={16} /> Approved prospects</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{approvedProspects}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Mail size={16} /> Sends tracked</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{data.outboundSends.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MessageSquareReply size={16} /> Reply rate</CardTitle></CardHeader><CardContent className="space-y-2"><div className="text-3xl font-semibold">{replyRate}%</div><Progress value={replyRate} /></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current campaign guidance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{activeCampaign?.name}</p>
                <p className="text-sm text-muted-foreground">{String((activeCampaign?.configuration as { icp?: string } | null)?.icp ?? "ICP being refined through Sarah's guided conversation")}</p>
              </div>
              <Badge variant={statusTone(activeCampaign?.status)}>{activeCampaign?.status ?? "draft"}</Badge>
            </div>
            <Separator />
            <div className="grid gap-3 md:grid-cols-3">
              <div><p className="text-xs uppercase text-muted-foreground">ICP validation</p><p className="font-medium">{data.icpCriteria[0]?.validation_status ?? "needs input"}</p></div>
              <div><p className="text-xs uppercase text-muted-foreground">Next send</p><p className="font-medium">{nextAction?.scheduled_at ? new Date(nextAction.scheduled_at).toLocaleString() : "Not scheduled"}</p></div>
              <div><p className="text-xs uppercase text-muted-foreground">Sequence status</p><p className="font-medium">{data.sequences.filter((s) => s.approval_status === "approved").length}/{data.sequences.length} approved</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Activity size={16} /> Attention queue</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.prospects.filter((p) => p.approval_status !== "approved").map((p) => (
              <div key={p.id} className="rounded-lg border p-3"><div className="flex items-center justify-between"><p className="font-medium">Approve {p.name}</p><Badge variant="secondary">{p.approval_status}</Badge></div><p className="text-sm text-muted-foreground">{p.company} · {p.email}</p></div>
            ))}
            {data.replies.filter((r) => r.review_status === "needs_review").map((r) => (
              <div key={r.id} className="rounded-lg border p-3"><p className="flex items-center gap-2 font-medium"><CheckCircle2 size={15} /> Reply needs review</p><p className="line-clamp-2 text-sm text-muted-foreground">{r.reply_body}</p></div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default OverviewTab;
