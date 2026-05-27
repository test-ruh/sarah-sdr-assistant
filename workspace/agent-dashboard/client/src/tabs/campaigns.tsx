import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ruh-ai/ruh-design-system";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultCampaigns } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
// Reflects campaign artifacts and configurations stored in `result_campaigns`.
const stubCampaigns: ResultCampaigns[] = [
  { id: "11111111-1111-4111-8111-111111111111", run_id: "run-sdr-01", computed_at: "2026-05-27T09:00:00Z", name: "Fintech RevOps directors", status: "prospect_approval", owner_context: { owner: "Growth" }, configuration: { goal: "Book RevOps discovery calls", icp: "US fintech RevOps teams", timing: "Day 1, Day 4, Day 9" }, created_at: "2026-05-24T15:00:00Z", updated_at: "2026-05-27T09:00:00Z", org_id: null, agent_id: "sarah" },
  { id: "22222222-2222-4222-8222-222222222222", run_id: "run-sdr-02", computed_at: "2026-05-27T08:20:00Z", name: "Healthcare analytics pilots", status: "sequence_ready", owner_context: { owner: "Enterprise" }, configuration: { goal: "Start pilot conversations", icp: "Healthcare analytics leaders", timing: "Twice weekly" }, created_at: "2026-05-20T12:00:00Z", updated_at: "2026-05-27T08:20:00Z", org_id: null, agent_id: "sarah" }
];

function configText(configuration: unknown) {
  if (!configuration || typeof configuration !== "object") return "Campaign configuration pending";
  const cfg = configuration as { goal?: string; icp?: string; timing?: string };
  return [cfg.goal, cfg.icp, cfg.timing].filter(Boolean).join(" · ") || "Campaign configuration pending";
}

export function CampaignsTab() {
  const { data = { rows: stubCampaigns } } = useQuery<{ rows: ResultCampaigns[] }>({
    queryKey: ["sdr-campaigns"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/campaigns`).then((r) => r.json()),
    placeholderData: { rows: stubCampaigns },
    enabled: !!apiBaseUrl
  });

  return (
    <section className="space-y-5 p-6" aria-label="Campaign artifacts">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck size={18} /> Campaign artifact review</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Campaign</TableHead><TableHead>Status</TableHead><TableHead>Configuration</TableHead><TableHead>Updated</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.rows.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell><Badge variant="secondary">{campaign.status ?? "draft"}</Badge></TableCell>
                  <TableCell className="max-w-xl text-muted-foreground">{configText(campaign.configuration)}</TableCell>
                  <TableCell>{campaign.updated_at ? new Date(campaign.updated_at).toLocaleString() : "Pending"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

export default CampaignsTab;
