# Sarah dashboard design

Sarah is a conversational SDR assistant for sales teams that need guided ICP definition, campaign setup, prospect approval, email sequencing, scheduled sends, Email API reply capture, and Slack/dashboard coordination. The dashboard keeps the operator focused on what Sarah can safely advance now versus what still needs human input.

## Tabs

- **Overview** — The landing surface summarizes active campaign artifacts, approved prospect readiness, outbound Email API progress, replies needing review, next scheduled sends/follow-ups, and human-attention items. It is backed by the campaign, prospect, scheduled-action, send, and reply result tables so the operator can quickly see whether Sarah is blocked by validation, approval, schedule, or reply review.
- **Conversation** — The dashboard campaign-creation surface for starting or updating campaigns. It captures campaign name, optional campaign ID for update, ICP/value proposition/configuration details, sequence requirements, and timing. Submissions call `POST /api/sdr/conversation`, which upserts durable pending rows into `result_campaigns` and `result_icp_criteria` with preserved operator input and honest pending statuses for Sarah's setup workflow to consume.
- **Campaigns** — Reviews stored campaign artifacts from `result_campaigns`, including status, configuration, owner/channel context, and update time. This is the audit surface for what Sarah believes is pending validation, waiting on approval, or ready for sequence work.
- **Prospects** — Shows campaign prospects from `result_prospects` with email, company, profile, and approval status. The tab emphasizes that retrieved prospect-list changes stay held until a sales team member approves them.
- **Sequence** — Shows generated email steps from `result_email_sequences` and scheduled sends/follow-ups from `result_scheduled_actions`, including approval status, timing metadata, and queue state.
- **Activity** — Shows outbound send tracking from `result_outbound_sends`, inbound replies from `result_replies`, provider metadata, reply-review status, and Slack/dashboard coordination context for approval prompts and campaign updates.

## Triggers

- Campaign sequence send time — sends approved sequence email through Email API at the campaign-defined scheduled time.
- Campaign follow-up time — sends approved follow-up email through Email API at the campaign-defined scheduled time.
- Email reply received — captures Email API reply payload, stores reply history, and makes the reply available for review and Slack coordination.

## Sidebar additions

None. Sarah's operator workflow fits the dashboard tabs and the platform-managed Actions entry.

## Server endpoints

- `GET /api/sdr/overview` — returns recent campaigns, prospects, scheduled actions, outbound sends, and replies for Sarah's overview metrics and next-action cards.
- `GET /api/sdr/conversation` — returns recent pending/active campaign handoffs and ICP validation rows so the conversation tab can show durable saved artifacts.
- `POST /api/sdr/conversation` — validates required campaign name and setup brief, preserves the submitted dashboard payload, upserts a `pending_runtime_validation` row into `result_campaigns`, upserts a `pending_sarah_validation` row into `result_icp_criteria`, and returns the saved artifacts for Sarah's setup workflow handoff.
- `GET /api/sdr/campaigns` — returns stored campaign artifacts and configuration ordered by last update.
- `GET /api/sdr/prospects?status=<status>` — returns campaign prospects, optionally filtered by approval status, for the prospect approval workflow.
- `GET /api/sdr/sequence` — returns generated email sequence steps and scheduled campaign sends/follow-ups.
- `GET /api/sdr/activity` — returns recent campaigns, Email API outbound send tracking, and inbound reply review data for activity and coordination views.

## Runtime and auth consistency

The dashboard reflects Sarah's saved workflow and environment requirements: platform prospect database access, Email API send/reply tracking, Slack coordination, and runtime-managed `agent_vault` bearer credentials for Email API and Slack secrets. The dashboard does not expose or store secret values.

## v2 Deferrals

No v2-tagged Custom Features were present in the approved PRD Dashboard Requirements.
