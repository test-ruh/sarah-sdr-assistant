import { Hono } from "hono";

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

type ConversationPayload = {
  campaignId?: unknown;
  icpCriteriaId?: unknown;
  campaignName?: unknown;
  brief?: unknown;
  surface?: unknown;
  requestedBy?: unknown;
  owner?: unknown;
  icpCriteria?: unknown;
  sequenceRequirements?: unknown;
  timing?: unknown;
  configuration?: unknown;
};

const trim = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const uuidLike = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const objectOrEmpty = (value: unknown) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

route.get("/sdr/overview", async (c) => {
  const campaigns = await sql<ResultCampaigns[]>`
    SELECT * FROM result_campaigns
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 8
  `;
  const prospects = await sql<ResultProspects[]>`
    SELECT * FROM result_prospects
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 30
  `;
  const scheduled = await sql<ResultScheduledActions[]>`
    SELECT * FROM result_scheduled_actions
    ORDER BY scheduled_at ASC NULLS LAST
    LIMIT 30
  `;
  const sends = await sql<ResultOutboundSends[]>`
    SELECT * FROM result_outbound_sends
    ORDER BY sent_at DESC NULLS LAST
    LIMIT 30
  `;
  const replies = await sql<ResultReplies[]>`
    SELECT * FROM result_replies
    ORDER BY received_at DESC NULLS LAST
    LIMIT 30
  `;

  return c.json({ campaigns, prospects, scheduled, sends, replies });
});

route.get("/sdr/conversation", async (c) => {
  const campaigns = await sql<ResultCampaigns[]>`
    SELECT * FROM result_campaigns
    WHERE status IN (${"pending_runtime_validation"}, ${"needs_follow_up"}, ${"draft"}, ${"in_progress"}, ${"sequence_ready"})
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 12
  `;
  const icpCriteria = await sql<ResultIcpCriteria[]>`
    SELECT * FROM result_icp_criteria
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 24
  `;

  return c.json({ campaigns, icpCriteria });
});

route.post("/sdr/conversation", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as ConversationPayload;
  const now = new Date().toISOString();
  const submittedName = trim(body.campaignName);
  const submittedBrief = trim(body.brief);
  const suppliedCampaignId = trim(body.campaignId);
  const suppliedCriteriaId = trim(body.icpCriteriaId);
  const campaignId = suppliedCampaignId && uuidLike(suppliedCampaignId) ? suppliedCampaignId : crypto.randomUUID();
  const icpCriteriaId = suppliedCriteriaId && uuidLike(suppliedCriteriaId) ? suppliedCriteriaId : crypto.randomUUID();
  const requestedBy = trim(body.requestedBy) || trim(body.owner) || "dashboard_operator";
  const surface = trim(body.surface) || "dashboard";
  const sequenceRequirements = trim(body.sequenceRequirements);
  const timing = trim(body.timing);

  if (!submittedName || !submittedBrief) {
    return c.json(
      {
        ok: false,
        status: "missing_campaign_details",
        message: "Campaign name and setup brief are required before Sarah can create a pending handoff."
      },
      400
    );
  }

  const suppliedConfiguration = objectOrEmpty(body.configuration);
  const configuration = {
    ...suppliedConfiguration,
    source: "dashboard_conversation",
    handoff_status: "pending_runtime_validation",
    submitted_at: now,
    campaign_name: submittedName,
    brief: submittedBrief,
    sequence_requirements: sequenceRequirements || null,
    timing: timing || null,
    requested_by: requestedBy,
    surface,
    workflow_consumption:
      "Sarah setup workflow consumes pending result_campaigns and result_icp_criteria rows before validation, prospect retrieval, sequence generation, and approval gates."
  };

  const ownerContext = {
    entrypoint: "dashboard_conversation",
    requested_by: requestedBy,
    last_operator_message: submittedBrief,
    preserved_input: body,
    handoff: "result_table_pending_artifact"
  };

  const criteria = {
    raw_campaign_setup_brief: submittedBrief,
    campaign_name: submittedName,
    icp_criteria: body.icpCriteria ?? null,
    sequence_requirements: sequenceRequirements || null,
    timing: timing || null,
    source: "dashboard_conversation",
    requires_sarah_validation: true
  };

  const campaigns = await sql<ResultCampaigns[]>`
    INSERT INTO result_campaigns (id, run_id, computed_at, name, status, owner_context, configuration, created_at, updated_at)
    VALUES (
      ${campaignId},
      ${`dashboard-conversation-${campaignId}`},
      ${now},
      ${submittedName},
      ${"pending_runtime_validation"},
      ${JSON.stringify(ownerContext)}::jsonb,
      ${JSON.stringify(configuration)}::jsonb,
      ${now},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      run_id = EXCLUDED.run_id,
      computed_at = EXCLUDED.computed_at,
      name = EXCLUDED.name,
      status = EXCLUDED.status,
      owner_context = EXCLUDED.owner_context,
      configuration = EXCLUDED.configuration,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `;

  const icpCriteria = await sql<ResultIcpCriteria[]>`
    INSERT INTO result_icp_criteria (id, run_id, computed_at, campaign_id, criteria, validation_status, created_at, updated_at)
    VALUES (
      ${icpCriteriaId},
      ${`dashboard-conversation-${campaignId}`},
      ${now},
      ${campaignId},
      ${JSON.stringify(criteria)}::jsonb,
      ${"pending_sarah_validation"},
      ${now},
      ${now}
    )
    ON CONFLICT (id) DO UPDATE SET
      run_id = EXCLUDED.run_id,
      computed_at = EXCLUDED.computed_at,
      campaign_id = EXCLUDED.campaign_id,
      criteria = EXCLUDED.criteria,
      validation_status = EXCLUDED.validation_status,
      updated_at = EXCLUDED.updated_at
    RETURNING *
  `;

  return c.json({
    ok: true,
    status: "pending_campaign_handoff_saved",
    workflow_handoff: "result_table_pending_artifact",
    campaign: campaigns[0],
    icpCriteria: icpCriteria[0],
    next_step:
      "Sarah has a durable pending campaign artifact to validate before prospect retrieval, sequence generation, scheduling, and approval gates continue."
  });
});

route.get("/sdr/campaigns", async (c) => {
  const rows = await sql<ResultCampaigns[]>`
    SELECT * FROM result_campaigns
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 25
  `;

  return c.json({ rows });
});

route.get("/sdr/prospects", async (c) => {
  const status = c.req.query("status");
  const rows = await sql<ResultProspects[]>`
    SELECT * FROM result_prospects
    ${status ? sql`WHERE approval_status = ${status}` : sql``}
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 50
  `;

  return c.json({ rows });
});

route.get("/sdr/sequence", async (c) => {
  const sequences = await sql<ResultEmailSequences[]>`
    SELECT * FROM result_email_sequences
    ORDER BY step_number ASC NULLS LAST, updated_at DESC NULLS LAST
    LIMIT 50
  `;
  const scheduled = await sql<ResultScheduledActions[]>`
    SELECT * FROM result_scheduled_actions
    ORDER BY scheduled_at ASC NULLS LAST
    LIMIT 50
  `;

  return c.json({ sequences, scheduled });
});

route.get("/sdr/activity", async (c) => {
  const campaigns = await sql<ResultCampaigns[]>`
    SELECT * FROM result_campaigns
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 10
  `;
  const sends = await sql<ResultOutboundSends[]>`
    SELECT * FROM result_outbound_sends
    ORDER BY sent_at DESC NULLS LAST
    LIMIT 50
  `;
  const replies = await sql<ResultReplies[]>`
    SELECT * FROM result_replies
    ORDER BY received_at DESC NULLS LAST
    LIMIT 50
  `;

  return c.json({ campaigns, sends, replies });
});
