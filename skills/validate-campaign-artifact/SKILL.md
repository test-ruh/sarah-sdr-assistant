---
id: validate-campaign-artifact
name: Validate Campaign Artifact
version: 1.0.0
description: Validate and normalize the SDR campaign artifact.
user_invocable: false
always: false
requires:
  bins: [bash, python3]
  env: [RUN_ID, PG_CONNECTION_STRING]
primary_env: PG_CONNECTION_STRING
input_path: /tmp/guide-campaign-setup_${RUN_ID}.json
output_path: /tmp/validate-campaign-artifact_${RUN_ID}.json
depends_on: [guide-campaign-setup]
---

## Purpose

Check that the campaign artifact has the required campaign, ICP, sequence, and timing fields before the workflow continues.

## I/O Contract

- **Input:** /tmp/guide-campaign-setup_${RUN_ID}.json with an artifact object from campaign setup.
- **Output:** /tmp/validate-campaign-artifact_${RUN_ID}.json, with schema/shape: JSON object containing `skill_id`, `run_id`, `status`, and the step fields described here.
- **DB Write:** result_campaigns and result_icp_criteria via data_writer.py upsert on columns [id].

## Notes

Sarah keeps the workflow approval-aware. Prospect-list changes and important send decisions are not treated as complete until the approval status is approved. Error messages are short and do not print secrets.
