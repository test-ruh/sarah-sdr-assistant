import { Badge, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ruh-ai/ruh-design-system";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Users } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultProspects } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
// Reflects approved and pending prospect records in `result_prospects`.
const stubProspects: ResultProspects[] = [
  { id: "44444444-4444-4444-8444-444444444441", run_id: "run-sdr-01", computed_at: "2026-05-27T09:10:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", email: "maya.chen@ledgerlane.example", name: "Maya Chen", company: "LedgerLane", profile: { title: "Director of RevOps", fit: "High", reason: "Owns revenue tooling consolidation" }, approval_status: "approved", created_at: "2026-05-25T10:00:00Z", updated_at: "2026-05-27T09:10:00Z", org_id: null, agent_id: "sarah" },
  { id: "44444444-4444-4444-8444-444444444442", run_id: "run-sdr-01", computed_at: "2026-05-27T09:10:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", email: "omar.patel@paynorth.example", name: "Omar Patel", company: "PayNorth", profile: { title: "VP Sales", fit: "Medium", reason: "Evaluating outbound reporting process" }, approval_status: "pending_approval", created_at: "2026-05-25T10:05:00Z", updated_at: "2026-05-27T09:10:00Z", org_id: null, agent_id: "sarah" },
  { id: "44444444-4444-4444-8444-444444444443", run_id: "run-sdr-01", computed_at: "2026-05-27T09:12:00Z", campaign_id: "11111111-1111-4111-8111-111111111111", email: "nina.garcia@capstack.example", name: "Nina Garcia", company: "CapStack", profile: { title: "Revenue Operations Lead", fit: "High", reason: "Hiring for sales systems operations" }, approval_status: "approved", created_at: "2026-05-25T10:10:00Z", updated_at: "2026-05-27T09:12:00Z", org_id: null, agent_id: "sarah" }
];

function profileSummary(profile: unknown) {
  if (!profile || typeof profile !== "object") return "No profile summary yet";
  const p = profile as { title?: string; fit?: string; reason?: string };
  return [p.title, p.fit ? `${p.fit} fit` : undefined, p.reason].filter(Boolean).join(" · ");
}

export function ProspectsTab() {
  const { data = { rows: stubProspects } } = useQuery<{ rows: ResultProspects[] }>({
    queryKey: ["sdr-prospects"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/prospects`).then((r) => r.json()),
    placeholderData: { rows: stubProspects },
    enabled: !!apiBaseUrl
  });

  const pending = data.rows.filter((row) => row.approval_status !== "approved");

  return (
    <section className="space-y-5 p-6" aria-label="Prospect approval tracking">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users size={16} /> Prospects</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{data.rows.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck size={16} /> Approved</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{data.rows.length - pending.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Needs approval</CardTitle></CardHeader><CardContent className="text-3xl font-semibold">{pending.length}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Prospect list approval workflow</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Prospect</TableHead><TableHead>Company</TableHead><TableHead>Fit context</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.rows.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell><p className="font-medium">{prospect.name}</p><p className="text-xs text-muted-foreground">{prospect.email}</p></TableCell>
                  <TableCell>{prospect.company}</TableCell>
                  <TableCell className="max-w-lg text-muted-foreground">{profileSummary(prospect.profile)}</TableCell>
                  <TableCell><Badge variant={prospect.approval_status === "approved" ? "default" : "secondary"}>{prospect.approval_status ?? "pending"}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}

export default ProspectsTab;
