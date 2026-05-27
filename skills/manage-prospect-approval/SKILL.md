---
id: manage-prospect-approval
name: Manage Prospect Approval
version: 1.0.0
description: Prepare prospect-list changes for human approval and persist only approved prospects.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID, PG_CONNECTION_STRING, PLATFORM_PROSPECT_DB_URL]
primary_env: PLATFORM_PROSPECT_DB_URL
input_path: /tmp/validate-campaign-artifact_${RUN_ID}.json
output_path: /tmp/manage-prospect-approval_${RUN_ID}.json
depends_on: [validate-campaign-artifact]
---

## Purpose

Retrieve campaign-matched prospects from the approved platform prospect database, then keep humans in control of prospect-list changes. The skill records approved prospects only when approval is present.

## I/O Contract

- **Input:** /tmp/validate-campaign-artifact_${RUN_ID}.json with campaign ID, ICP criteria, campaign context, and approval status.
- **Output:** /tmp/manage-prospect-approval_${RUN_ID}.json, with schema/shape: JSON object containing `skill_id`, `run_id`, `status`, `campaign_id`, `normalized_artifact`, `icp`, `value_proposition`, `sequence_requirements`, `timing`, `held_changes` for review, and `approved_prospects` after approval.
- **DB Write:** result_prospects via data_writer.py upsert on columns [id].

## Notes

Sarah only uses the approved platform prospect database. Prospect-list changes are not treated as complete until the approval status is approved. Error messages are short and do not print secrets.
