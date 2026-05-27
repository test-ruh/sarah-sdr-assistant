# Step 5 of 5 — Access

## User Access

### Authorized Teams

| Team               | Access Level | Members (approx) |
|--------------------|-------------|-------------------|
| Sales development team | Use Sarah | Sales users and campaign owners |

### Restricted From

| Team / Role          | Reason                          |
|----------------------|---------------------------------|
| Unauthenticated users | Workspace data is private. |
| Non-sales teams | Sarah can prepare outbound prospecting actions and should be used by authorized sales operators only. |

## HiTL Approvers

| Skill                | Action                         | Approver             | Fallback Approver    |
|----------------------|--------------------------------|----------------------|----------------------|
| manage-prospect-approval | Approve retrieved platform prospect-list changes before persistence and downstream sequence generation. | Sales manager or campaign owner | Pause and do not persist prospects. |
| generate-email-sequence | Approve generated email sequence before scheduling sends and follow-ups. | Sales manager or campaign owner | Pause and do not schedule. |
| send-campaign-email | Approve scheduled sends before Email API delivery. | Sales manager or campaign owner | Do not send. |

## Model Configuration

| Field                | Value                          |
|----------------------|--------------------------------|
| **Primary Model**    | OpenAI GPT-4.1   |
| **Fallback Model**   | OpenAI GPT-4.1 mini  |

## Token Budget

| Field                  | Value                  |
|------------------------|------------------------|
| **Monthly Budget**     | 1000000 tokens |
| **Alert Threshold**    | 800000 tokens |
| **Auto-Pause on Limit**| Yes |

## Security & Permissions

| Permission                         | Allowed    |
|------------------------------------|------------|
| Retrieve campaign-matched prospects from the platform prospect database | ✅ |
| Persist approved prospects and campaign artifacts to result tables | ✅ |
| Send approved outbound campaign emails through Email API | ✅ |
| Send unapproved prospecting emails | ❌ |
