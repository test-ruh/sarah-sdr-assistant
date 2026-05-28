import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Separator, Textarea } from "@ruh-ai/ruh-design-system";
import { MessageSquareText, Send, ShieldCheck } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultCampaigns, ResultIcpCriteria } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
const stubCampaigns: ResultCampaigns[] = [
  {
    id: "11111111-1111-4111-8111-111111111112",
    run_id: "dashboard-conversation-11111111-1111-4111-8111-111111111112",
    computed_at: "2026-05-27T15:10:00Z",
    name: "Healthcare finance leaders",
    status: "pending_runtime_validation",
    owner_context: { entrypoint: "dashboard_conversation", requested_by: "Sales Ops", handoff: "result_table_pending_artifact" },
    configuration: { source: "dashboard_conversation", handoff_status: "pending_runtime_validation", brief: "Validate ICP and ask for compliance constraints before prospect retrieval.", timing: "Tuesday mornings UTC" },
    created_at: "2026-05-27T15:10:00Z",
    updated_at: "2026-05-27T15:10:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "11111111-1111-4111-8111-111111111111",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    name: "Mid-market RevOps directors",
    status: "sequence_ready",
    owner_context: { entrypoint: "dashboard_conversation", requested_by: "Sales Ops" },
    configuration: { icp: "B2B SaaS, 200-1200 employees", sequence: "3 touches over 9 business days", timing: "Tue and Thu mornings UTC" },
    created_at: "2026-05-24T09:00:00Z",
    updated_at: "2026-05-27T14:00:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  }
];

// Stub data — preview fallback + cold-start initial render.
const stubIcpCriteria: ResultIcpCriteria[] = [
  {
    id: "77777777-7777-4777-8777-777777777770",
    run_id: "dashboard-conversation-11111111-1111-4111-8111-111111111112",
    computed_at: "2026-05-27T15:10:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111112",
    criteria: { raw_campaign_setup_brief: "Finance leaders at healthcare SaaS companies; confirm compliance constraints before outreach.", requires_sarah_validation: true },
    validation_status: "pending_sarah_validation",
    created_at: "2026-05-27T15:10:00Z",
    updated_at: "2026-05-27T15:10:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "77777777-7777-4777-8777-777777777771",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    campaign_id: "11111111-1111-4111-8111-111111111111",
    criteria: { segment: "mid-market SaaS", titles: ["VP Revenue Operations", "Director of RevOps"], employee_range: "200-1200" },
    validation_status: "validated",
    created_at: "2026-05-24T09:20:00Z",
    updated_at: "2026-05-27T13:40:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  }
];

type ConversationPayload = {
  campaignName: string;
  brief: string;
  campaignId?: string;
  sequenceRequirements?: string;
  timing?: string;
  surface: "dashboard";
  requestedBy: string;
};

type ConversationResponse = {
  ok: boolean;
  status: string;
  next_step?: string;
  message?: string;
  campaign?: ResultCampaigns;
  icpCriteria?: ResultIcpCriteria;
};

type ConversationState = {
  campaigns: ResultCampaigns[];
  icpCriteria: ResultIcpCriteria[];
};

const stubConversationState: ConversationState = {
  campaigns: stubCampaigns,
  icpCriteria: stubIcpCriteria
};

const statusText = (value: string | null | undefined) => value?.replace(/_/g, " ") ?? "waiting";

const formatDateTime = (value: string | null) =>
  value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(value)) + " UTC" : "not recorded";

async function saveConversationHandoff(payload: ConversationPayload): Promise<ConversationResponse> {
  const response = await fetch(`${apiBaseUrl}/api/sdr/conversation`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = (await response.json()) as ConversationResponse;
  if (!response.ok) {
    throw new Error(result.message ?? "Sarah could not save the campaign handoff.");
  }
  return result;
}

export default function ConversationTab() {
  const queryClient = useQueryClient();
  const [campaignId, setCampaignId] = useState("");
  const [campaignName, setCampaignName] = useState("Healthcare finance leaders");
  const [brief, setBrief] = useState(
    "ICP: CFOs and finance operations leaders at healthcare SaaS companies, 150-900 employees. Value proposition: reduce manual revenue reconciliation. Ask follow-up questions about compliance constraints before prospect retrieval."
  );
  const [sequenceRequirements, setSequenceRequirements] = useState("Three-step email sequence: concise intro, customer proof point, polite close-the-loop follow-up.");
  const [timing, setTiming] = useState("Send step 1 Tuesday 09:30 UTC, follow up four and nine business days later.");

  const { data = stubConversationState } = useQuery<ConversationState>({
    queryKey: ["sdr-conversation"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/conversation`).then((response) => response.json()),
    placeholderData: stubConversationState,
    enabled: !!apiBaseUrl
  });

  const mutation = useMutation({
    mutationFn: saveConversationHandoff,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sdr-conversation"] });
      void queryClient.invalidateQueries({ queryKey: ["sdr-campaigns"] });
      void queryClient.invalidateQueries({ queryKey: ["sdr-overview"] });
    }
  });

  const submit = () => {
    mutation.mutate({
      campaignId: campaignId.trim() || undefined,
      campaignName,
      brief,
      sequenceRequirements,
      timing,
      surface: "dashboard",
      requestedBy: "dashboard_operator"
    });
  };

  const latestCriteria = data.icpCriteria[0];

  return (
    <section className="grid gap-4 p-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MessageSquareText className="h-5 w-5" /> Campaign creation conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Badge>Sarah</Badge>
              <span className="text-xs text-muted-foreground">Guided setup prompt</span>
            </div>
            <p className="text-sm">
              Share the ICP, sequence requirements, timing, and campaign configuration. Sarah saves a pending artifact, validates it, asks follow-up questions when needed, retrieves prospects, and keeps approval gates in place before outreach.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign name</Label>
              <Input id="campaign-name" value={campaignName} onChange={(event) => setCampaignName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign-id">Existing campaign ID for update</Label>
              <Input id="campaign-id" value={campaignId} onChange={(event) => setCampaignId(event.target.value)} placeholder="Leave blank to start a campaign" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brief">ICP, value proposition, and configuration</Label>
            <Textarea id="brief" value={brief} onChange={(event) => setBrief(event.target.value)} className="min-h-32" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sequence-requirements">Sequence requirements</Label>
              <Textarea id="sequence-requirements" value={sequenceRequirements} onChange={(event) => setSequenceRequirements(event.target.value)} className="min-h-24" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timing">Timing</Label>
              <Textarea id="timing" value={timing} onChange={(event) => setTiming(event.target.value)} className="min-h-24" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={submit} disabled={!apiBaseUrl || mutation.isPending}>
              <Send className="mr-2 h-4 w-4" />
              {mutation.isPending ? "Saving handoff…" : "Save handoff for Sarah"}
            </Button>
            {!apiBaseUrl ? <span className="text-xs text-muted-foreground">Live handoff is enabled after deployment; the saved-state preview is shown here.</span> : null}
          </div>

          {mutation.isError ? (
            <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {(mutation.error as Error).message}
            </div>
          ) : null}
          {mutation.data ? (
            <div role="status" className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <p className="font-medium">{statusText(mutation.data.status)}</p>
              <p className="mt-1 text-muted-foreground">{mutation.data.next_step ?? mutation.data.message}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Durable handoff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Submissions are written to `result_campaigns` and `result_icp_criteria` with honest pending statuses instead of a transient acknowledgement.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge>pending_runtime_validation</Badge>
              <Badge variant="secondary">pending_sarah_validation</Badge>
              <Badge variant="secondary">prospect approval preserved</Badge>
            </div>
            <Separator />
            <div>
              <p className="font-medium">Latest ICP validation</p>
              <p className="text-muted-foreground">{statusText(latestCriteria?.validation_status)} · {formatDateTime(latestCriteria?.updated_at ?? null)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent campaign artifacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.campaigns.slice(0, 4).map((campaign) => (
              <div key={campaign.id} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{campaign.name ?? "Untitled campaign"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Updated {formatDateTime(campaign.updated_at)}</p>
                  </div>
                  <Badge variant={campaign.status === "pending_runtime_validation" ? "default" : "secondary"}>{statusText(campaign.status)}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
