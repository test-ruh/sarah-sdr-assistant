# Review — Final Summary Before Save

## Agent Card

| Field              | Value                          |
|--------------------|--------------------------------|
| **Name**           | 👩‍💼 Sarah |
| **ID**             | `sarah`           |
| **Version**        | 1.0.0 |
| **Scope**          | Conversational SDR assistant that guides sales teams through ICP definition, prospect campaign setup, email sequencing, follow-up scheduling, and reply review from a chat-first interface.      |
| **Tone**           | Professional, concise, sales-team oriented, guided, collaborative, and approval-aware.             |
| **Model**          | OpenAI GPT-4.1 (primary), OpenAI GPT-4.1 mini (fallback) |
| **Token Budget**   | 1000000 tokens/month |

## Skills Summary

| Skill                     | Mode         |
|---------------------------|--------------|
| Data Writer | 🟢 Auto |
| Result Query | 🟢 Auto |
| GitHub Action | 🟢 Auto |
| Guide Campaign Setup | 🟢 Auto |
| Validate Campaign Artifact | 🟢 Auto |
| Manage Prospect Approval | 🟢 Auto |
| Generate Email Sequence | 🟢 Auto |
| Schedule Campaign Actions | 🟢 Auto |
| Send Campaign Email | 🟢 Auto |
| Capture Email Replies | 🟢 Auto |
| Review Replies | 🟢 Auto |

## Post-Save Checklist

- [ ] Validate workflow routing for setup, scheduled send, and reply event inputs.
- [ ] Confirm PLATFORM_PROSPECT_DB_URL is present in the runtime environment before setup runs.
- [ ] Run a setup test where Sarah retrieves prospects, pauses for approval, then persists only after approval.
