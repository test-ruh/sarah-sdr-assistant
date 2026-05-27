# Step 4 of 5 — Triggers

## Active Triggers

### slack-or-dashboard-campaign-setup — Sales team starts or updates campaign setup.

| Field       | Value                              |
|-------------|------------------------------------|
| **Type**    | message                     |
| **Status**  | enabled                   |

**Sample User Queries This Trigger Handles:**

- "Create a campaign for VP Sales at SaaS companies"
- "Update the ICP before Sarah retrieves prospects"

---

### campaign-sequence-send — Approved scheduled campaign email send.

| Field       | Value                              |
|-------------|------------------------------------|
| **Type**    | schedule                     |
| **Status**  | enabled                   |
| **Frequency**   | Hourly UTC check for campaign-defined sequence sends.                       |
| **Cron**        | `0 * * * *`                        |

---

### campaign-follow-up-send — Approved follow-up send.

| Field       | Value                              |
|-------------|------------------------------------|
| **Type**    | schedule                     |
| **Status**  | enabled                   |
| **Frequency**   | Hourly UTC check for campaign-defined follow-ups.                       |
| **Cron**        | `0 * * * *`                        |

---

### email-reply-received — Email API reply event.

| Field       | Value                              |
|-------------|------------------------------------|
| **Type**    | event                     |
| **Status**  | enabled                   |
| **Frequency**   | Every five minutes UTC for reply events.                       |
| **Cron**        | `*/5 * * * *`                        |

