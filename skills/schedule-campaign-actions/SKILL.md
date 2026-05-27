---
id: schedule-campaign-actions
name: Schedule Campaign Actions
version: 1.0.0
description: Create send and follow-up schedule actions from approved sequence timing.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID, PG_CONNECTION_STRING]
primary_env: PG_CONNECTION_STRING
input_path: /tmp/generate-email-sequence_${RUN_ID}.json
output_path: /tmp/schedule-campaign-actions_${RUN_ID}.json
depends_on: [generate-email-sequence]
---

## Purpose

Turn approved campaign timing into scheduled send and follow-up actions for each approved prospect.

## I/O Contract

- **Input:** /tmp/generate-email-sequence_${RUN_ID}.json with approved prospects, approved sequence steps, and campaign timing.
- **Output:** /tmp/schedule-campaign-actions_${RUN_ID}.json, with schema/shape: JSON object containing `skill_id`, `run_id`, `status`, and the step fields described here.
- **DB Write:** result_scheduled_actions via data_writer.py upsert on columns [id].

## Notes

Sarah keeps the workflow approval-aware. Prospect-list changes and important send decisions are not treated as complete until the approval status is approved. Error messages are short and do not print secrets.
