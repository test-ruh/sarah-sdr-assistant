import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Separator, Textarea } from "@ruh-ai/ruh-design-system";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { useState } from "react";

import { apiBaseUrl } from "@/lib/api";
import type { ResultCampaigns } from "../../../server/schema";

// Stub data — preview fallback + cold-start initial render.
// Reflects campaign records in `result_campaigns` that Sarah can update from the dashboard conversation.
const stubCampaigns: ResultCampaigns[] = [
  { id: "11111111-1111-4111-8111-111111111111", run_id: "run-sdr-01", computed_at: "2026-05-27T09:00:00Z", name: "Fintech RevOps directors", status: "collecting_inputs", owner_context: { team: "Growth", channel: "dashboard" }, configuration: { icp: "US fintech RevOps teams, 80-600 employees", sequence: "Three-touch sequence focused on reporting handoffs", timing: "Day 1 morning, Day 4 afternoon, Day 9 morning" }, created_at: "2026-05-24T15:00:00Z", updated_at: "2026-05-27T09:00:00Z", org_id: null, agent_id: "sarah" }
];

type ConversationResponse = { campaign: ResultCampaigns; assistantMessage: string };

export function ConversationTab() {
  const queryClient = useQueryClient();
  const [campaignName, setCampaignName] = useState(stubCampaigns[0]?.name ?? "");
  const [icp, setIcp] = useState(String((stubCampaigns[0]?.configuration as { icp?: string } | null)?.icp ?? ""));
  const [sequence, setSequence] = useState(String((stubCampaigns[0]?.configuration as { sequence?: string } | null)?.sequence ?? ""));
  const [timing, setTiming] = useState(String((stubCampaigns[0]?.configuration as { timing?: string } | null)?.timing ?? ""));
  const [message, setMessage] = useState("Please validate the ICP, retrieve prospects for approval, and draft an approval-gated sequence.");
  const [assistantMessage, setAssistantMessage] = useState("Tell me the campaign goal, ICP, sequence requirements, and timing. I’ll keep prospect and send decisions approval-gated.");

  const { data = { rows: stubCampaigns } } = useQuery<{ rows: ResultCampaigns[] }>({
    queryKey: ["sdr-campaigns"],
    queryFn: () => fetch(`${apiBaseUrl}/api/sdr/campaigns`).then((r) => r.json()),
    placeholderData: { rows: stubCampaigns },
    enabled: !!apiBaseUrl
  });

  const saveConversation = useMutation<ConversationResponse>({
    mutationFn: () =>
      fetch(`${apiBaseUrl}/api/sdr/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: data.rows[0]?.id, campaign_name: campaignName, icp, sequence, timing, message })
      }).then((r) => r.json()),
    onSuccess: (result) => {
      setAssistantMessage(result.assistantMessage);
      queryClient.invalidateQueries({ queryKey: ["sdr-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["sdr-overview"] });
    }
  });

  const canSubmit = Boolean(apiBaseUrl && campaignName.trim() && (message.trim() || icp.trim() || sequence.trim() || timing.trim()));

  return (
    <section className="grid gap-5 p-6 lg:grid-cols-[1.1fr_0.9fr]" aria-label="Sarah campaign conversation">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MessageCircle size={18} /> Guided campaign setup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="campaign-name">Campaign name</Label><Input id="campaign-name" value={campaignName} onChange={(event) => setCampaignName(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="timing">Sequence timing</Label><Input id="timing" value={timing} onChange={(event) => setTiming(event.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="icp">ICP criteria</Label><Textarea id="icp" value={icp} onChange={(event) => setIcp(event.target.value)} rows={4} /></div>
          <div className="space-y-2"><Label htmlFor="sequence">Sequence requirements</Label><Textarea id="sequence" value={sequence} onChange={(event) => setSequence(event.target.value)} rows={4} /></div>
          <div className="space-y-2"><Label htmlFor="message">Message Sarah</Label><Textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} rows={4} /></div>
          <div className="flex items-center gap-3">
            <Button disabled={!canSubmit || saveConversation.isPending} onClick={() => saveConversation.mutate()}><Send size={15} /> Start or update campaign</Button>
            {!apiBaseUrl ? <Badge variant="secondary">Preview uses fallback data; live save activates after deployment</Badge> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles size={18} /> Sarah response and artifact status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-6">{assistantMessage}</div>
          <Separator />
          {data.rows.map((campaign) => (
            <div key={campaign.id} className="space-y-2 rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-medium">{campaign.name}</p><Badge>{campaign.status ?? "draft"}</Badge></div>
              <p className="text-sm text-muted-foreground">Updated {campaign.updated_at ? new Date(campaign.updated_at).toLocaleString() : "after next workflow run"}</p>
              <p className="text-sm">Sarah will validate the campaign artifact, request prospect approval, generate sequence copy, schedule approved sends, and monitor Email API replies.</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

export default ConversationTab;
