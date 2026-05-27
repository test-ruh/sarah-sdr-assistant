# Workflow — Routed Sarah Process Flow

Executed by the [Lobster runtime](https://github.com/openclaw/lobster) via `lobster run workflows/main.yaml`.
Sarah first provisions the result-table schema, then routes the run into one of three branches: setup, scheduled send, or reply review.

## Shared First Steps

1. **provision-schema** → prepares Sarah's result tables.
2. **route-trigger** → reads the incoming payload and sets `route` to `setup`, `send`, or `reply`.

## Setup Branch — Campaign Setup, Prospect Approval, Sequence Approval, Scheduling

Runs when `route-trigger` selects `setup`, which is the default for dashboard or Slack campaign setup messages.

1. **guide-campaign-setup** collects ICP, campaign, sequence, and timing details from the operator.
2. **validate-campaign-artifact** validates and normalizes the campaign artifact.
3. **prepare-prospect-list** runs `manage-prospect-approval` before any approval request. In this pending mode, Sarah retrieves campaign-matched prospects from the platform prospect database and returns held changes for review.
4. **prospect-list-approval** presents the retrieved pending prospect list and asks the operator to approve it.
5. **manage-prospect-approval** runs again only when `prospect-list-approval` is approved. This step persists only the approved prospect list and passes the approved list downstream.
6. **generate-email-sequence** creates sequence content from the approved campaign and approved prospects.
7. **sequence-send-approval** asks the operator to approve the email sequence and scheduling plan.
8. **schedule-campaign-actions** runs only after sequence approval and creates campaign-defined send and follow-up actions.

## Send Branch — Scheduled Send Approval and Delivery

Runs when `route-trigger` selects `send`, such as a campaign sequence or follow-up send payload.

1. **scheduled-send-approval** asks the operator to approve sending the scheduled campaign email or follow-up now.
2. **send-campaign-email** runs only when the send approval is granted, then delivers through the Email API and stores send status.

## Reply Branch — Reply Capture and Review

Runs when `route-trigger` selects `reply`, such as an Email API reply event payload.

1. **capture-email-replies** stores the incoming reply and campaign/prospect correlation data.
2. **review-replies** summarizes captured replies and prepares next-step prompts for the sales team.

## Approval Gates

- **prospect-list-approval** approves the retrieved platform prospect list before any prospect persistence or sequence generation.
- **sequence-send-approval** approves generated sequence content before scheduling sends and follow-ups.
- **scheduled-send-approval** approves each scheduled outbound send before Email API delivery.

When Lobster pauses at an approval gate, resume with `action: "resume"` and the returned `requiresApproval.resumeToken`. Use `approve: true` to continue and `approve: false` to cancel.

## Branch Diagram

```text
shared: provision-schema → route-trigger

setup: route-trigger(setup) → guide-campaign-setup → validate-campaign-artifact → prepare-prospect-list → prospect-list-approval → manage-prospect-approval → generate-email-sequence → sequence-send-approval → schedule-campaign-actions

send: route-trigger(send) → scheduled-send-approval → send-campaign-email

reply: route-trigger(reply) → capture-email-replies → review-replies
```
