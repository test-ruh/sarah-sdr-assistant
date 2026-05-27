---
id: send-campaign-email
name: Send Campaign Email
version: 1.0.0
description: Send scheduled approved sequence emails through the Email API and store send status.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID, EMAIL_API_BASE_URL, EMAIL_API_KEY, PG_CONNECTION_STRING]
primary_env: EMAIL_API_KEY
input_path: /tmp/schedule-campaign-actions_${RUN_ID}.json
output_path: /tmp/send-campaign-email_${RUN_ID}.json
depends_on: [schedule-campaign-actions]
---

## Purpose

Send only approved scheduled campaign emails or follow-ups through the Email API, then store the provider message ID and send status.

## I/O Contract

- **Input:** /tmp/schedule-campaign-actions_${RUN_ID}.json or trigger payload with scheduled action, prospect email, sequence content, and approval state.
- **Output:** /tmp/send-campaign-email_${RUN_ID}.json, with schema/shape: JSON object containing `skill_id`, `run_id`, `status`, and the step fields described here.
- **DB Write:** result_outbound_sends via data_writer.py upsert on columns [id].

## Notes

Sarah keeps the workflow approval-aware. Prospect-list changes and important send decisions are not treated as complete until the approval status is approved. Error messages are short and do not print secrets.
