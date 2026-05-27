---
id: guide-campaign-setup
name: Guide Campaign Setup
version: 1.0.0
description: Collect ICP, sequence, timing, and campaign details through dashboard or Slack conversation.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID]
primary_env: RUN_ID
input_path: /dev/stdin
output_path: /tmp/guide-campaign-setup_${RUN_ID}.json
depends_on: []
---

## Purpose

Guide Sarah’s dashboard or Slack campaign setup. It updates the draft campaign artifact and lists simple follow-up questions when required details are missing.

## I/O Contract

- **Input:** Dashboard or Slack message payload and optional existing campaign artifact. Expected fields include message, channel, user, and artifact.
- **Output:** /tmp/guide-campaign-setup_${RUN_ID}.json, with schema/shape: JSON object containing `skill_id`, `run_id`, `status`, and the step fields described here.
- **DB Write:** none.

## Notes

Sarah keeps the workflow approval-aware. Prospect-list changes and important send decisions are not treated as complete until the approval status is approved. Error messages are short and do not print secrets.
