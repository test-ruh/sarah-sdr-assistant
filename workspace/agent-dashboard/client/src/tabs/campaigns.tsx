import { useQuery } from "@tanstack/react-query";
import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ruh-ai/ruh-design-system";
import { FileText } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultCampaigns } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
const stubCampaigns: ResultCampaigns[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    run_id: "run-sarah-2026-05-27-a",
    computed_at: "2026-05-27T14:00:00Z",
    name: "Mid-market RevOps directors",
    status: "sequence_ready",
    owner_context: { owner: "Sales Ops", channel: "dashboard", last_operator_message: "Prioritize RevOps teams replacing spreadsheet handoffs." },
    configuration: { icp: "B2B SaaS, 200-1200 employees", value_proposition: "Reduce manual handoffs in revenue planning", sequence: "3 touches over 9 business days", timing: "Tue and Thu mornings UTC" },
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
    configuration: { source: "dashboard_conversation", handoff_status: "pending_runtime_validation", brief: "Validate ICP and ask for compliance constraints before prospect retrieval.", timing: "Tuesday mornings UTC" },
    created_at: "2026-05-27T15:10:00Z",
    updated_at: "2026-05-27T15:10:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  },
  {
    id: "11111111-1111-4111-8111-111111111113",
    run_id: "run-sarah-2026-05-26-b",
    computed_at: "2026-05-26T18:30:00Z",
    name: "Data platform expansion",
    status: "prospect_approval_needed",
    owner_context: { owner: "Growth", channel: "slack", slack_channel: "#sdr-campaigns" },
    configuration: { icp: "Analytics engineering leaders at Series B data companies", sequence: "2 touches", approval_reason: "new prospect list retrieved" },
    created_at: "2026-05-26T12:00:00Z",
    updated_at: "2026-05-26T18:30:00Z",
    org_id: "org-preview",
    agent_id: "sarah"
  }
];

const stubCampaignResponse = { rows: stubCampaigns };

const statusText = (value: string | null) => value?.replace(/_/g, " ") ?? "unknown";
const formatDateTime = (value: string | null) =>
  value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(value)) + " UTC" : "not recorded";

function summarize(value: unknown) {
  if (!value) return "No configuration recorded";
  if (typeof value === "string") return value;
  const json = JSON.stringify(value);
  return json.length > 180 ? `${json.slice(0, 180)}…` : json;
}

export default function CampaignsTab() {
  const { data = stubCampaignResponse } = useQuery<typeof stubCampaignResponse>({
    queryKey: ["sdr-campaigns"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/campaigns`).then((response) => response.json()),
    placeholderData: stubCampaignResponse,
    enabled: !!apiBaseUrl
  });

  const pendingHandOffs = data.rows.filter((campaign) => campaign.status === "pending_runtime_validation").length;
  const approvalNeeded = data.rows.filter((campaign) => campaign.status?.includes("approval")).length;

  return (
    <section className="space-y-4 p-6">
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Stored campaign artifacts</p>
            <p className="text-2xl font-semibold">{data.rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Sarah validation</p>
            <p className="text-2xl font-semibold">{pendingHandOffs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Approval-sensitive campaigns</p>
            <p className="text-2xl font-semibold">{approvalNeeded}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Campaign artifact review</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Configuration Sarah will use</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name ?? "Untitled campaign"}</TableCell>
                  <TableCell><Badge variant={campaign.status === "pending_runtime_validation" ? "default" : "secondary"}>{statusText(campaign.status)}</Badge></TableCell>
                  <TableCell className="max-w-xl text-sm text-muted-foreground">{summarize(campaign.configuration)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDateTime(campaign.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
