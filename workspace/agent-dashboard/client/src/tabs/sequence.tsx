import { Badge, Card, CardContent, CardHeader, CardTitle, Separator } from "@ruh-ai/ruh-design-system";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, MailCheck } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultEmailSequences, ResultScheduledActions } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
// Reflects generated sequence rows from `result_email_sequences`.
const stubEmailSequences: ResultEmailSequences[] = [
  { id: "55555555-5555-4555-8555-555555555551", run_id: "run-sdr-01", computed_at: "2026-05-27T09:20:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", step_number: 1, subject: "Reducing RevOps handoffs at fintech teams", body: "Mention dashboard handoff pain, ask whether RevOps reporting delays are a current priority, and offer a short benchmark.", timing: { offset_days: 0, window: "09:00-11:00 UTC" }, approval_status: "approved", created_at: "2026-05-26T11:00:00Z", updated_at: "2026-05-27T09:20:00Z", org_id: null, agent_id: "sarah" },
  { id: "55555555-5555-4555-8555-555555555552", run_id: "run-sdr-01", computed_at: "2026-05-27T09:20:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", step_number: 2, subject: "Following up with a quick RevOps benchmark", body: "Follow up with one insight from similar fintech teams and keep the CTA to a 15-minute review.", timing: { offset_days: 4, window: "14:00-16:00 UTC" }, approval_status: "needs_review", created_at: "2026-05-26T11:05:00Z", updated_at: "2026-05-27T09:20:00Z", org_id: null, agent_id: "sarah" }
];

// Stub data — preview fallback + cold-start initial render.
// Reflects campaign timing rows from `result_scheduled_actions`.
const stubScheduledActions: ResultScheduledActions[] = [
  { id: "66666666-6666-4666-8666-666666666661", run_id: "run-sdr-01", computed_at: "2026-05-27T09:30:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", prospect_id: "44444444-4444-4444-8444-444444444441", sequence_id: "55555555-5555-4555-8555-555555555551", action_type: "sequence_send", scheduled_at: "2026-05-28T09:30:00Z", status: "scheduled", created_at: "2026-05-27T09:30:00Z", updated_at: "2026-05-27T09:30:00Z", org_id: null, agent_id: "sarah" },
  { id: "66666666-6666-4666-8666-666666666662", run_id: "run-sdr-01", computed_at: "2026-05-27T09:35:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", prospect_id: "44444444-4444-4444-8444-444444444441", sequence_id: "55555555-5555-4555-8555-555555555552", action_type: "follow_up", scheduled_at: "2026-06-01T14:00:00Z", status: "awaiting_sequence_approval", created_at: "2026-05-27T09:35:00Z", updated_at: "2026-05-27T09:35:00Z", org_id: null, agent_id: "sarah" }
];

type SequencePayload = { sequences: ResultEmailSequences[]; scheduledActions: ResultScheduledActions[] };
const stubSequencePayload: SequencePayload = { sequences: stubEmailSequences, scheduledActions: stubScheduledActions };

function timingText(timing: unknown) {
  if (!timing || typeof timing !== "object") return "Timing pending";
  const t = timing as { offset_days?: number; window?: string };
  return `Day ${t.offset_days ?? 0} · ${t.window ?? "campaign window"}`;
}

export function SequenceTab() {
  const { data = stubSequencePayload } = useQuery<SequencePayload>({
    queryKey: ["sdr-sequence"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/sequence`).then((r) => r.json()),
    placeholderData: stubSequencePayload,
    enabled: !!apiBaseUrl
  });

  return (
    <section className="grid gap-5 p-6 lg:grid-cols-[1fr_0.9fr]" aria-label="Email sequence and schedule">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MailCheck size={18} /> Sequence content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {data.sequences.map((step) => (
            <div key={step.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-semibold">Step {step.step_number}: {step.subject}</p><Badge variant={step.approval_status === "approved" ? "default" : "secondary"}>{step.approval_status}</Badge></div>
              <p className="mt-2 text-sm text-muted-foreground">{timingText(step.timing)}</p>
              <Separator className="my-3" />
              <p className="text-sm leading-6">{step.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock size={18} /> Scheduled sends and follow-ups</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.scheduledActions.map((action) => (
            <div key={action.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between"><p className="font-medium">{action.action_type}</p><Badge variant="secondary">{action.status}</Badge></div>
              <p className="mt-2 text-sm text-muted-foreground">{action.scheduled_at ? new Date(action.scheduled_at).toLocaleString() : "Waiting for campaign timing"}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export default SequenceTab;
