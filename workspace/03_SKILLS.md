# Step 3 of 5 — Skills

## Added Skills

| #    | Skill ID                  | Skill Name               | Mode   | Risk Level | Description                |
|------|---------------------------|--------------------------|--------|------------|----------------------------|
| S1   | `data-writer` | Data Writer | Auto | Low | Provision, write, and query the agent database schema via scripts/data_writer.py. Use for all PostgreSQL operations and any result-table persistence. |
| S2   | `result-query` | Result Query | Auto | Low | Read stored records from the agent result tables for inspection and follow-up questions. |
| S3   | `github-action` | GitHub Action | Auto | Low | Git branch + PR workflow for syncing agent changes to GitHub. Creates feature branches, commits changes, and opens pull requests against main. NEVER pushes to main directly. MANDATORY for every agent. |
| S4   | `guide-campaign-setup` | Guide Campaign Setup | Auto | Low | Collect ICP, sequence, timing, and campaign details through dashboard or Slack conversation. |
| S5   | `validate-campaign-artifact` | Validate Campaign Artifact | Auto | Low | Validate and normalize the SDR campaign artifact. |
| S6   | `manage-prospect-approval` | Manage Prospect Approval | Auto | Low | Prepare prospect-list changes for human approval and persist only approved prospects. |
| S7   | `generate-email-sequence` | Generate Email Sequence | Auto | Low | Create approved SDR sequence content from campaign, ICP, and prospect context. |
| S8   | `schedule-campaign-actions` | Schedule Campaign Actions | Auto | Low | Create send and follow-up schedule actions from approved sequence timing. |
| S9   | `send-campaign-email` | Send Campaign Email | Auto | Low | Send scheduled approved sequence emails through the Email API and store send status. |
| S10   | `capture-email-replies` | Capture Email Replies | Auto | Low | Capture Email API replies and store reply history for review. |
| S11   | `review-replies` | Review Replies | Auto | Low | Summarize captured replies and prepare dashboard or Slack next-step prompts. |

## Skill Dependencies (Execution Order)

```
data-writer
result-query
github-action
guide-campaign-setup
validate-campaign-artifact
manage-prospect-approval
generate-email-sequence
schedule-campaign-actions
send-campaign-email
capture-email-replies
review-replies
```

## Execution Mode Summary

| Mode  | Count          |
|-------|----------------|
| HiTL  | 0              |
| Auto  | 11 |
