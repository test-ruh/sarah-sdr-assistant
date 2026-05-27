---
id: review-replies
name: Review Replies
version: 1.0.0
description: Summarize captured replies and prepare dashboard or Slack next-step prompts.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID]
primary_env: RUN_ID
input_path: /tmp/capture-email-replies_${RUN_ID}.json
output_path: /tmp/review-replies_${RUN_ID}.json
depends_on: [capture-email-replies]
---

## Purpose

Help the sales team review captured replies and coordinate follow-up decisions in dashboard or Slack.

## I/O Contract

- **Input:** /tmp/capture-email-replies_${RUN_ID}.json with reply history and campaign context.
- **Output:** /tmp/review-replies_${RUN_ID}.json, with schema/shape: JSON object containing `skill_id`, `run_id`, `status`, and the step fields described here.
- **DB Write:** none.

## Notes

Sarah keeps the workflow approval-aware. Prospect-list changes and important send decisions are not treated as complete until the approval status is approved. Error messages are short and do not print secrets.
