// server/schema.ts — AUTO-GENERATED from .openclaw/workspace/result-schema.yml.
// Do not edit by hand. Re-run scaffold_agent_dashboard to regenerate.
//
// One TypeScript type per result_* table the agent declares + a ResultTables
// index. Platform-injected columns (created_at, updated_at, run_id, org_id,
// agent_id) are appended after agent-declared columns.

/** Campaign artifact and configuration for SDR outreach. */
export type ResultCampaigns = {
  id: string;
  run_id: string | null;
  computed_at: string | null;
  name: string | null;
  status: string | null;
  owner_context: unknown | null;
  configuration: unknown | null;
  created_at: string | null;
  updated_at: string | null;
  /** Org id (platform-managed). */
  org_id: string | null;
  /** Agent id (platform-managed). */
  agent_id: string | null;
};

/** ICP definition and validation status for a campaign. */
export type ResultIcpCriteria = {
  id: string;
  run_id: string | null;
  computed_at: string | null;
  campaign_id: string | null;
  criteria: unknown | null;
  validation_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  /** Org id (platform-managed). */
  org_id: string | null;
  /** Agent id (platform-managed). */
  agent_id: string | null;
};

/** Approved prospects and approval status for a campaign. */
export type ResultProspects = {
  id: string;
  run_id: string | null;
  computed_at: string | null;
  campaign_id: string | null;
  email: string | null;
  name: string | null;
  company: string | null;
  profile: unknown | null;
  approval_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  /** Org id (platform-managed). */
  org_id: string | null;
  /** Agent id (platform-managed). */
  agent_id: string | null;
};

/** Email sequence subject, body, timing, and approval status. */
export type ResultEmailSequences = {
  id: string;
  run_id: string | null;
  computed_at: string | null;
  campaign_id: string | null;
  step_number: number | null;
  subject: string | null;
  body: string | null;
  timing: unknown | null;
  approval_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  /** Org id (platform-managed). */
  org_id: string | null;
  /** Agent id (platform-managed). */
  agent_id: string | null;
};

/** Scheduled sends and follow-ups for approved campaign sequences. */
export type ResultScheduledActions = {
  id: string;
  run_id: string | null;
  computed_at: string | null;
  campaign_id: string | null;
  prospect_id: string | null;
  sequence_id: string | null;
  action_type: string | null;
  scheduled_at: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  /** Org id (platform-managed). */
  org_id: string | null;
  /** Agent id (platform-managed). */
  agent_id: string | null;
};

/** Email send tracking with provider message IDs and status. */
export type ResultOutboundSends = {
  id: string;
  run_id: string | null;
  computed_at: string | null;
  campaign_id: string | null;
  prospect_id: string | null;
  sequence_id: string | null;
  scheduled_action_id: string | null;
  email_api_message_id: string | null;
  send_status: string | null;
  sent_at: string | null;
  metadata: unknown | null;
  /** ISO timestamp (platform-managed). */
  created_at: string;
  /** ISO timestamp (platform-managed). */
  updated_at: string | null;
  /** Org id (platform-managed). */
  org_id: string | null;
  /** Agent id (platform-managed). */
  agent_id: string | null;
};

/** Prospect reply history and review status. */
export type ResultReplies = {
  id: string;
  run_id: string | null;
  computed_at: string | null;
  campaign_id: string | null;
  prospect_id: string | null;
  outbound_send_id: string | null;
  email_api_reply_id: string | null;
  reply_body: string | null;
  received_at: string | null;
  review_status: string | null;
  created_at: string | null;
  /** ISO timestamp (platform-managed). */
  updated_at: string | null;
  /** Org id (platform-managed). */
  org_id: string | null;
  /** Agent id (platform-managed). */
  agent_id: string | null;
};

export type ResultTables = {
  result_campaigns: ResultCampaigns;
  result_icp_criteria: ResultIcpCriteria;
  result_prospects: ResultProspects;
  result_email_sequences: ResultEmailSequences;
  result_scheduled_actions: ResultScheduledActions;
  result_outbound_sends: ResultOutboundSends;
  result_replies: ResultReplies;
};
