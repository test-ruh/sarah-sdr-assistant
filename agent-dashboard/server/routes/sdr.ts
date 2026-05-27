import { Hono } from "hono";
import { randomUUID } from "node:crypto";

import { sql } from "../db";
import type {
  ResultCampaigns,
  ResultEmailSequences,
  ResultIcpCriteria,
  ResultOutboundSends,
  ResultProspects,
  ResultReplies,
  ResultScheduledActions
} from "../schema";

export const route = new Hono();
export const path = "/api";

async function readJson(c: { req: { json: () => Promise<unknown> } }) {
  try {
    return (await c.req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

route.get("/sdr/overview", async (c) => {
  const [campaigns, prospects, sequences, scheduledActions, outboundSends, replies, icpCriteria] = await Promise.all([
    sql<ResultCampaigns[]>`SELECT * FROM result_campaigns ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST LIMIT 12`,
    sql<ResultProspects[]>`SELECT * FROM result_prospects ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST LIMIT 100`,
    sql<ResultEmailSequences[]>`SELECT * FROM result_email_sequences ORDER BY step_number ASC NULLS LAST, updated_at DESC NULLS LAST LIMIT 50`,
    sql<ResultScheduledActions[]>`SELECT * FROM result_scheduled_actions ORDER BY scheduled_at ASC NULLS LAST LIMIT 80`,
    sql<ResultOutboundSends[]>`SELECT * FROM result_outbound_sends ORDER BY sent_at DESC NULLS LAST LIMIT 80`,
    sql<ResultReplies[]>`SELECT * FROM result_replies ORDER BY received_at DESC NULLS LAST LIMIT 50`,
    sql<ResultIcpCriteria[]>`SELECT * FROM result_icp_criteria ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST LIMIT 20`
  ]);

  return c.json({ campaigns, prospects, sequences, scheduledActions, outboundSends, replies, icpCriteria });
});

route.get("/sdr/campaigns", async (c) => {
  const rows = await sql<ResultCampaigns[]>`
    SELECT * FROM result_campaigns
    ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
    LIMIT 50
  `;
  return c.json({ rows });
});

route.post("/sdr/campaigns", async (c) => {
  const body = await readJson(c);
  const campaignId = typeof body.id === "string" && body.id ? body.id : randomUUID();
  const name = typeof body.name === "string" && body.name ? body.name : "New SDR campaign";
  const status = typeof body.status === "string" && body.status ? body.status : "draft";
  const ownerContext = body.owner_context && typeof body.owner_context === "object" ? body.owner_context : { source: "dashboard" };
  const configuration = body.configuration && typeof body.configuration === "object" ? body.configuration : body;

  const rows = await sql<ResultCampaigns[]>`
    INSERT INTO result_campaigns (id, run_id, computed_at, name, status, owner_context, configuration, created_at, updated_at)
    VALUES (${campaignId}, ${"dashboard"}, NOW(), ${name}, ${status}, CAST(${JSON.stringify(ownerContext)} AS jsonb), CAST(${JSON.stringify(configuration)} AS jsonb), NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      status = EXCLUDED.status,
      owner_context = EXCLUDED.owner_context,
      configuration = EXCLUDED.configuration,
      computed_at = EXCLUDED.computed_at,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `;
  return c.json({ row: rows[0] });
});

route.post("/sdr/conversation", async (c) => {
  const body = await readJson(c);
  const campaignId = typeof body.campaign_id === "string" && body.campaign_id ? body.campaign_id : randomUUID();
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const campaignName = typeof body.campaign_name === "string" && body.campaign_name ? body.campaign_name : "Dashboard guided campaign";
  const icp = typeof body.icp === "string" ? body.icp : "";
  const timing = typeof body.timing === "string" ? body.timing : "";
  const sequence = typeof body.sequence === "string" ? body.sequence : "";
  const configuration = { source: "dashboard_conversation", message, icp, timing, sequence, updated_by: "operator" };

  const campaigns = await sql<ResultCampaigns[]>`
    INSERT INTO result_campaigns (id, run_id, computed_at, name, status, owner_context, configuration, created_at, updated_at)
    VALUES (${campaignId}, ${"dashboard"}, NOW(), ${campaignName}, ${message ? "collecting_inputs" : "draft"}, CAST(${JSON.stringify({ source: "dashboard", channel: "conversation" })} AS jsonb), CAST(${JSON.stringify(configuration)} AS jsonb), NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      status = EXCLUDED.status,
      configuration = EXCLUDED.configuration,
      computed_at = EXCLUDED.computed_at,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `;

  if (icp) {
    await sql<ResultIcpCriteria[]>`
      INSERT INTO result_icp_criteria (id, run_id, computed_at, campaign_id, criteria, validation_status, created_at, updated_at)
      VALUES (${randomUUID()}, ${"dashboard"}, NOW(), ${campaignId}, CAST(${JSON.stringify({ summary: icp })} AS jsonb), ${"needs_validation"}, NOW(), NOW())
      RETURNING *
    `;
  }

  return c.json({
    campaign: campaigns[0],
    assistantMessage: message
      ? "I captured that campaign update. Next I will validate the ICP, prepare prospect approval, and keep sends gated for review."
      : "I created a draft campaign. Add ICP, sequence goals, and timing so I can guide the next step."
  });
});

route.get("/sdr/prospects", async (c) => {
  const campaignId = c.req.query("campaignId");
  const rows = campaignId
    ? await sql<ResultProspects[]>`SELECT * FROM result_prospects WHERE campaign_id = ${campaignId} ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST LIMIT 100`
    : await sql<ResultProspects[]>`SELECT * FROM result_prospects ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST LIMIT 100`;
  return c.json({ rows });
});

route.get("/sdr/sequence", async (c) => {
  const campaignId = c.req.query("campaignId");
  const sequences = campaignId
    ? await sql<ResultEmailSequences[]>`SELECT * FROM result_email_sequences WHERE campaign_id = ${campaignId} ORDER BY step_number ASC NULLS LAST LIMIT 50`
    : await sql<ResultEmailSequences[]>`SELECT * FROM result_email_sequences ORDER BY campaign_id, step_number ASC NULLS LAST LIMIT 50`;
  const scheduledActions = campaignId
    ? await sql<ResultScheduledActions[]>`SELECT * FROM result_scheduled_actions WHERE campaign_id = ${campaignId} ORDER BY scheduled_at ASC NULLS LAST LIMIT 80`
    : await sql<ResultScheduledActions[]>`SELECT * FROM result_scheduled_actions ORDER BY scheduled_at ASC NULLS LAST LIMIT 80`;
  return c.json({ sequences, scheduledActions });
});

route.get("/sdr/activity", async (c) => {
  const campaignId = c.req.query("campaignId");
  const outboundSends = campaignId
    ? await sql<ResultOutboundSends[]>`SELECT * FROM result_outbound_sends WHERE campaign_id = ${campaignId} ORDER BY sent_at DESC NULLS LAST LIMIT 100`
    : await sql<ResultOutboundSends[]>`SELECT * FROM result_outbound_sends ORDER BY sent_at DESC NULLS LAST LIMIT 100`;
  const replies = campaignId
    ? await sql<ResultReplies[]>`SELECT * FROM result_replies WHERE campaign_id = ${campaignId} ORDER BY received_at DESC NULLS LAST LIMIT 100`
    : await sql<ResultReplies[]>`SELECT * FROM result_replies ORDER BY received_at DESC NULLS LAST LIMIT 100`;
  return c.json({ outboundSends, replies });
});
