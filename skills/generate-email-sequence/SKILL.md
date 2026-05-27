---
id: generate-email-sequence
name: Generate Email Sequence
version: 1.0.0
description: Create approved SDR sequence content from campaign, ICP, and prospect context.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID, PG_CONNECTION_STRING]
primary_env: PG_CONNECTION_STRING
input_path: /tmp/manage-prospect-approval_${RUN_ID}.json
output_path: /tmp/generate-email-sequence_${RUN_ID}.json
depends_on: [manage-prospect-approval]
---

## Purpose

Prepare email sequence steps for human review using the campaign artifact, ICP criteria, and approved prospect context.

## I/O Contract

- **Input:** /tmp/manage-prospect-approval_${RUN_ID}.json with normalized campaign data and approved prospects.
- **Output:** /tmp/generate-email-sequence_${RUN_ID}.json, with schema/shape: JSON object containing `skill_id`, `run_id`, `status`, and the step fields described here.
- **DB Write:** result_email_sequences via data_writer.py upsert on columns [id].

## Notes

Sarah keeps the workflow approval-aware. Prospect-list changes and important send decisions are not treated as complete until the approval status is approved. Error messages are short and do not print secrets.
