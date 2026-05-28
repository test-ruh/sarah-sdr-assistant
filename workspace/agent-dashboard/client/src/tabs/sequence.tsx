import { useQuery } from "@tanstack/react-query";
import { Badge, Card, CardContent, CardHeader, CardTitle, Separator, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ruh-ai/ruh-design-system";
import { CalendarClock, Send } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultEmailSequences, ResultScheduledActions } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
const stubEmailSequences: ResultEmailSequences[] = [
  {
    id: "44444444-4444-4444-8444-444444444440",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    step_number: 1,
    subject: "Operational visibility for RevOps",
    body: "Concise opening email generated from the approved campaign artifact, tailored to RevOps leaders replacing manual spreadsheet handoffs.",
    timing: { offset_business_days: 0, recommended_window: "Tuesday 09:30 UTC" },
    approval_status: "approved",
    created_at: "2026-05-26T10:00:00Z",
    updated_at: "2026-05-27T12:00:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "44444444-4444-4444-8444-444444444441",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    step_number: 2,
    subject: "How teams reduce revenue handoffs",
    body: "Proof-point follow-up that references the same ICP and approved prospect context without changing the offer.",
    timing: { offset_business_days: 4, recommended_window: "Thursday 09:30 UTC" },
    approval_status: "approved",
    created_at: "2026-05-26T10:05:00Z",
    updated_at: "2026-05-27T12:05:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "44444444-4444-4444-8444-444444444442",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    step_number: 3,
    subject: "Worth closing the loop?",
    body: "Polite final follow-up draft awaiting review before Sarah schedules it for approved prospects.",
    timing: { offset_business_days: 9, recommended_window: "Tuesday 09:30 UTC" },
    approval_status: "needs_review",
    created_at: "2026-05-26T10:10:00Z",
    updated_at: "2026-05-27T12:10:00Z",
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

const stubSequenceResponse = {
  sequences: stubEmailSequences,
  scheduled: stubScheduledActions
};

const statusText = (value: string | null) => value?.replace(/_/g, " ") ?? "unknown";
const formatDateTime = (value: string | null) =>
  value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(value)) + " UTC" : "not scheduled";

function timingSummary(value: unknown) {
  if (!value || typeof value !== "object") return "Timing not specified";
  const timing = value as { offset_business_days?: unknown; recommended_window?: unknown };
  const offset = typeof timing.offset_business_days === "number" ? `Day ${timing.offset_business_days}` : "Campaign-defined cadence";
  const window = typeof timing.recommended_window === "string" ? timing.recommended_window : "UTC window pending";
  return `${offset} · ${window}`;
}

export default function SequenceTab() {
  const { data = stubSequenceResponse } = useQuery<typeof stubSequenceResponse>({
    queryKey: ["sdr-sequence"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/sequence`).then((response) => response.json()),
    placeholderData: stubSequenceResponse,
    enabled: !!apiBaseUrl
  });

  const approvedSteps = data.sequences.filter((sequence) => sequence.approval_status === "approved").length;
  const futureActions = data.scheduled.filter((action) => action.status !== "sent").length;

  return (
    <section className="space-y-4 p-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Send className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Approved sequence steps</p>
              <p className="text-2xl font-semibold">{approvedSteps} / {data.sequences.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><CalendarClock className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Scheduled sends and follow-ups</p>
              <p className="text-2xl font-semibold">{futureActions}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {data.sequences.map((sequence) => {
          const actions = data.scheduled.filter((action) => action.sequence_id === sequence.id);
          return (
            <Card key={sequence.id}>
              <CardHeader>
                <CardTitle>Step {sequence.step_number}: {sequence.subject ?? "Untitled email"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={sequence.approval_status === "approved" ? "default" : "secondary"}>{statusText(sequence.approval_status)}</Badge>
                  <Badge variant="secondary">{timingSummary(sequence.timing)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{sequence.body}</p>
                <Separator />
                {actions.length > 0 ? actions.map((action) => (
                  <div key={action.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{statusText(action.action_type)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(action.scheduled_at)} · {statusText(action.status)}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No scheduled action yet.</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Sequence</TableHead>
                <TableHead>Scheduled time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.scheduled.map((action) => (
                <TableRow key={action.id}>
                  <TableCell>{statusText(action.action_type)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{action.sequence_id}</TableCell>
                  <TableCell>{formatDateTime(action.scheduled_at)}</TableCell>
                  <TableCell><Badge variant={action.status === "scheduled" ? "default" : "secondary"}>{statusText(action.status)}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
