import { useQuery } from "@tanstack/react-query";
import { Badge, Card, CardContent, CardHeader, CardTitle, Separator, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ruh-ai/ruh-design-system";
import { MailCheck, MessageSquare, Reply } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultCampaigns, ResultOutboundSends, ResultReplies } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
const stubCampaigns: ResultCampaigns[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    name: "Mid-market RevOps directors",
    status: "sequence_ready",
    owner_context: { owner: "Sales Ops", channel: "dashboard", slack_channel: "#sdr-campaigns" },
    configuration: { icp: "B2B SaaS RevOps", sequence: "3 touches", timing: "Tue and Thu mornings UTC" },
    created_at: "2026-05-24T09:00:00Z",
    updated_at: "2026-05-27T14:00:00Z",
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
    metadata: { provider: "Email API", slack_notice: true, campaign_notification: "delivery status shared" },
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
    metadata: { provider: "Email API", slack_notice: false, campaign_notification: "email accepted by provider" },
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
  },
  {
    id: "66666666-6666-4666-8666-666666666662",
    run_id: "run-sarah-2026-05-26-c",
    computed_at: "2026-05-26T19:20:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    prospect_id: "22222222-2222-4222-8222-222222222223",
    outbound_send_id: "55555555-5555-4555-8555-555555555550",
    email_api_reply_id: "reply_8998",
    reply_body: "Not the right owner, please reach out to our sales ops lead.",
    received_at: "2026-05-26T19:17:00Z",
    review_status: "reviewed",
    created_at: "2026-05-26T19:18:00Z",
    updated_at: "2026-05-26T19:20:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  }
];

type ActivityPayload = {
  campaigns: ResultCampaigns[];
  sends: ResultOutboundSends[];
  replies: ResultReplies[];
};

const stubActivity: ActivityPayload = {
  campaigns: stubCampaigns,
  sends: stubOutboundSends,
  replies: stubReplies
};

const statusText = (value: string | null) => value?.replace(/_/g, " ") ?? "unknown";
const formatDateTime = (value: string | null) =>
  value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(value)) + " UTC" : "not sent";

function metadataSummary(value: unknown) {
  if (!value || typeof value !== "object") return "Provider metadata not stored";
  const metadata = value as { provider?: unknown; campaign_notification?: unknown; queued_reason?: unknown; slack_notice?: unknown };
  const parts = [metadata.provider, metadata.campaign_notification, metadata.queued_reason].filter((part): part is string => typeof part === "string" && part.length > 0);
  if (metadata.slack_notice === true) parts.push("Slack notice sent");
  return parts.join(" · ") || "Metadata stored";
}

export default function ActivityTab() {
  const { data = stubActivity } = useQuery<ActivityPayload>({
    queryKey: ["sdr-activity"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/activity`).then((response) => response.json()),
    placeholderData: stubActivity,
    enabled: !!apiBaseUrl
  });

  const repliesNeedingReview = data.replies.filter((reply) => reply.review_status !== "reviewed").length;
  const slackNotices = data.sends.filter((send) => typeof send.metadata === "object" && send.metadata !== null && (send.metadata as { slack_notice?: unknown }).slack_notice === true).length;

  return (
    <section className="space-y-4 p-6">
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MailCheck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Outbound email events</p>
              <p className="text-2xl font-semibold">{data.sends.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Reply className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Replies needing review</p>
              <p className="text-2xl font-semibold">{repliesNeedingReview}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Slack notices recorded</p>
              <p className="text-2xl font-semibold">{slackNotices}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email API sends</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent time</TableHead>
                <TableHead>Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sends.map((send) => (
                <TableRow key={send.id}>
                  <TableCell className="font-medium">{send.email_api_message_id ?? "pending provider id"}</TableCell>
                  <TableCell><Badge variant={send.send_status === "delivered" ? "default" : "secondary"}>{statusText(send.send_status)}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(send.sent_at)}</TableCell>
                  <TableCell className="max-w-lg text-sm text-muted-foreground">{metadataSummary(send.metadata)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Reply review queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reply ID</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Review status</TableHead>
                  <TableHead>Reply excerpt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.replies.map((reply) => (
                  <TableRow key={reply.id}>
                    <TableCell className="font-medium">{reply.email_api_reply_id ?? reply.id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(reply.received_at)}</TableCell>
                    <TableCell><Badge variant={reply.review_status === "reviewed" ? "secondary" : "default"}>{statusText(reply.review_status)}</Badge></TableCell>
                    <TableCell className="max-w-md text-sm text-muted-foreground">{reply.reply_body}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slack and dashboard coordination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Sarah uses Slack for campaign setup inputs, approval prompts, status updates, and reply review notifications while Email API events remain stored in the result tables shown here.
            </p>
            <Separator />
            {data.campaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-lg border p-3">
                <p className="font-medium">{campaign.name ?? "Untitled campaign"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{statusText(campaign.status)} · last updated {formatDateTime(campaign.updated_at)}</p>
              </div>
            ))}
            <Badge variant="secondary">agent_vault bearer auth remains runtime-managed</Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
