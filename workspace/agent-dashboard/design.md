# Sarah dashboard design

Sarah 👩‍💼 is a conversational SDR assistant for sales teams that need a guided, approval-aware surface for campaign setup, ICP definition, prospect review, email sequence generation, schedule tracking, Email API sends, reply review, and Slack coordination.

## Tabs

- **Overview** — Shows the operator Sarah's current SDR operating picture: active campaign artifacts, approved prospect count, send tracking, reply rate, next scheduled action, ICP validation state, sequence approval progress, and attention items for prospect approvals and reply review. This is the first surface because SDR operators need to know what needs approval and what will send next.
- **Conversation** — Provides a live dashboard conversation form for starting or updating campaigns. Operators can enter campaign name, ICP criteria, sequence requirements, timing, and a message for Sarah. The tab posts to `/api/sdr/conversation`, which creates or updates the stored campaign artifact and ICP validation work item instead of leaving the surface read-only.
- **Campaigns** — Reviews stored campaign artifact and configuration records from `result_campaigns`, including status, ICP/goal/timing summary, owner context, and latest update time. This supports campaign artifact review/update before prospect retrieval, sequence generation, and scheduling proceed.
- **Prospects** — Shows campaign prospects from `result_prospects`, including email, company, fit context, and approval status. The tab emphasizes pending approvals so prospect-list changes remain human-gated.
- **Sequence** — Shows generated sequence steps from `result_email_sequences` alongside schedule rows from `result_scheduled_actions`, including approval status, timing windows, scheduled send/follow-up time, and action state.
- **Activity** — Shows Email API send tracking from `result_outbound_sends`, inbound reply review from `result_replies`, provider metadata, and the Slack coordination role for setup updates, approval prompts, send notices, and reply review.

## Triggers

- `campaign-sequence-send` — campaign-defined scheduled trigger for approved sequence email sends.
- `campaign-follow-up-send` — campaign-defined scheduled trigger for approved follow-up sends.
- `email-reply-received` — Email API reply-event trigger for capturing prospect replies and preparing reply review.

## Sidebar additions

No custom sidebar additions are needed. Sarah's operator workflow is fully represented by the dashboard tabs plus the platform-provided Actions surface.

## Server endpoints

- `GET /api/sdr/overview` — returns campaigns, ICP criteria, prospects, sequence steps, scheduled actions, outbound sends, and replies for the landing metrics and attention queue.
- `GET /api/sdr/campaigns` — returns stored campaign artifacts and configuration for campaign review.
- `POST /api/sdr/campaigns` — creates or updates a campaign artifact in `result_campaigns` from dashboard-provided campaign configuration.
- `POST /api/sdr/conversation` — records a guided dashboard campaign setup/update, upserts the campaign artifact, and adds ICP validation state when ICP text is provided.
- `GET /api/sdr/prospects?campaignId=<id>` — returns approved and pending prospects for all campaigns or a selected campaign.
- `GET /api/sdr/sequence?campaignId=<id>` — returns generated email sequence content and scheduled send/follow-up rows.
- `GET /api/sdr/activity?campaignId=<id>` — returns Email API outbound send records and inbound reply records for activity and reply review.

## v2 Deferrals

No v2-tagged Custom Features were present in the PRD Dashboard Requirements.
