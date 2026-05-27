---
id: capture-email-replies
name: Capture Email Replies
version: 1.0.0
description: Capture Email API replies and store reply history for review.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID, EMAIL_API_BASE_URL, EMAIL_API_KEY, PG_CONNECTION_STRING]
primary_env: EMAIL_API_KEY
input_path: /tmp/send-campaign-email_${RUN_ID}.json
output_path: /tmp/capture-email-replies_${RUN_ID}.json
depends_on: [send-campaign-email]
---

## Purpose

Process Email API reply events, correlate replies to campaign/prospect/send records, and store reply history.

## I/O Contract

- **Input:** Email API reply event payload with message ID, campaign/prospect correlation data, reply body, and received time.
- **Output:** /tmp/capture-email-replies_${RUN_ID}.json, with schema/shape: JSON object containing `skill_id`, `run_id`, `status`, and the step fields described here.
- **DB Write:** result_replies via data_writer.py upsert on columns [id].

## Notes

Sarah keeps the workflow approval-aware. Prospect-list changes and important send decisions are not treated as complete until the approval status is approved. Error messages are short and do not print secrets.
