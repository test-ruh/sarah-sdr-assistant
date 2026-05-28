import { useQuery } from "@tanstack/react-query";
import { Badge, Card, CardContent, CardHeader, CardTitle, Progress, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ruh-ai/ruh-design-system";
import { Users } from "lucide-react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultProspects } from "../../../server/schema";

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

const stubProspectsResponse = { rows: stubProspects };

const statusText = (value: string | null) => value?.replace(/_/g, " ") ?? "unknown";
const badgeVariant = (status: string | null) => (status === "approved" ? "default" : "secondary");

function profileSummary(value: unknown) {
  if (!value || typeof value !== "object") return "No profile details";
  const profile = value as { title?: unknown; fit?: unknown; source?: unknown };
  const parts = [profile.title, profile.fit, profile.source].filter((part): part is string => typeof part === "string" && part.length > 0);
  return parts.join(" · ") || "Profile stored";
}

export default function ProspectsTab() {
  const { data = stubProspectsResponse } = useQuery<typeof stubProspectsResponse>({
    queryKey: ["sdr-prospects"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/prospects`).then((response) => response.json()),
    placeholderData: stubProspectsResponse,
    enabled: !!apiBaseUrl
  });

  const approved = data.rows.filter((prospect) => prospect.approval_status === "approved").length;
  const pending = data.rows.filter((prospect) => prospect.approval_status === "pending_review").length;
  const approvalRate = Math.round((approved / Math.max(data.rows.length, 1)) * 100);

  return (
    <section className="space-y-4 p-6">
      <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Prospect approvals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Approved list readiness</span>
              <span className="text-muted-foreground">{approvalRate}%</span>
            </div>
            <Progress value={approvalRate} />
            <div className="flex flex-wrap gap-2">
              <Badge>{approved} approved</Badge>
              <Badge variant="secondary">{pending} pending review</Badge>
              <Badge variant="secondary">human approval required</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval policy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sarah can retrieve campaign-relevant prospects from the platform prospect database, but list changes stay held until a sales team member approves them. Only approved prospects move into sequence generation and scheduling.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prospect tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prospect</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">{prospect.name ?? "Unnamed prospect"}</TableCell>
                  <TableCell>{prospect.company ?? "Unknown company"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{prospect.email ?? "No email stored"}</TableCell>
                  <TableCell className="max-w-sm text-sm text-muted-foreground">{profileSummary(prospect.profile)}</TableCell>
                  <TableCell><Badge variant={badgeVariant(prospect.approval_status)}>{statusText(prospect.approval_status)}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
