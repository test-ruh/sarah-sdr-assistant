import { Badge, Card, CardContent, CardHeader, CardTitle, Separator } from "@ruh-ai/ruh-design-system";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Mail, Slack } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultOutboundSends, ResultReplies } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
// Reflects Email API outbound tracking from `result_outbound_sends`.
const stubOutboundSends: ResultOutboundSends[] = [
  { id: "77777777-7777-4777-8777-777777777771", run_id: "run-sdr-02", computed_at: "2026-05-27T08:00:00Z", campaign_id: "22222222-2222-4222-8222-222222222222", prospect_id: "44444444-4444-4444-8444-444444444441", sequence_id: "55555555-5555-4555-8555-555555555551", scheduled_action_id: "66666666-6666-4666-8666-666666666661", email_api_message_id: "em_8F2K", send_status: "sent", sent_at: "2026-05-27T08:00:00Z", metadata: { provider: "Email API", event: "accepted", channel: "email" }, created_at: "2026-05-27T08:00:00Z", updated_at: "2026-05-27T08:01:00Z", org_id: null, agent_id: "sarah" },
  { id: "77777777-7777-4777-8777-777777777772", run_id: "run-sdr-02", computed_at: "2026-05-26T14:00:00Z", campaign_id: "22222222-2222-4222-8222-222222222222", prospect_id: "44444444-4444-4444-8444-444444444443", sequence_id: "55555555-5555-4555-8555-555555555551", scheduled_action_id: "66666666-6666-4666-8666-666666666661", email_api_message_id: "em_9QZ1", send_status: "accepted", sent_at: "2026-05-26T14:00:00Z", metadata: { provider: "Email API", event: "queued", slack_notice: "sent to #sdr-campaigns" }, created_at: "2026-05-26T14:00:00Z", updated_at: "2026-05-26T14:01:00Z", org_id: null, agent_id: "sarah" }
];

// Stub data — preview fallback + cold-start initial render.
// Reflects inbound reply tracking from `result_replies`.
const stubReplies: ResultReplies[] = [
  { id: "88888888-8888-4888-8888-888888888881", run_id: "run-sdr-02", computed_at: "2026-05-27T09:45:00Z", campaign_id: "22222222-2222-4222-8222-222222222222", prospect_id: "44444444-4444-4444-8444-444444444441", outbound_send_id: "77777777-7777-4777-8777-777777777771", email_api_reply_id: "reply_K31", reply_body: "Happy to look next week if you can share the RevOps benchmark.", received_at: "2026-05-27T09:42:00Z", review_status: "needs_review", created_at: "2026-05-27T09:45:00Z", updated_at: "2026-05-27T09:45:00Z", org_id: null, agent_id: "sarah" }
];

type ActivityPayload = { outboundSends: ResultOutboundSends[]; replies: ResultReplies[] };
const stubActivityPayload: ActivityPayload = { outboundSends: stubOutboundSends, replies: stubReplies };

function metadataText(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return "Provider metadata pending";
  return Object.entries(metadata as Record<string, unknown>).map(([key, value]) => `${key}: ${String(value)}`).join(" · ");
}

export function ActivityTab() {
  const { data = stubActivityPayload } = useQuery<ActivityPayload>({
    queryKey: ["sdr-activity"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/activity`).then((r) => r.json()),
    placeholderData: stubActivityPayload,
    enabled: !!apiBaseUrl
  });

  return (
    <section className="grid gap-5 p-6 lg:grid-cols-2" aria-label="Slack and email activity">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Mail size={18} /> Email API send tracking</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {data.outboundSends.map((send) => (
            <div key={send.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-medium">Message {send.email_api_message_id}</p><Badge>{send.send_status}</Badge></div>
              <p className="mt-2 text-sm text-muted-foreground">Sent {send.sent_at ? new Date(send.sent_at).toLocaleString() : "after approval"}</p>
              <p className="mt-2 text-xs text-muted-foreground">{metadataText(send.metadata)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Inbox size={18} /> Reply review and coordination</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {data.replies.map((reply) => (
            <div key={reply.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-medium">Reply {reply.email_api_reply_id}</p><Badge variant="secondary">{reply.review_status}</Badge></div>
              <p className="mt-2 text-sm leading-6">{reply.reply_body}</p>
              <p className="mt-2 text-xs text-muted-foreground">Received {reply.received_at ? new Date(reply.received_at).toLocaleString() : "recently"}</p>
            </div>
          ))}
          <Separator />
          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="flex items-center gap-2 font-medium"><Slack size={16} /> Slack coordination</p>
            <p className="mt-2 text-sm text-muted-foreground">Sarah mirrors campaign setup updates, approval prompts, send status, and reply-review notices to the configured sales Slack workspace.</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default ActivityTab;
