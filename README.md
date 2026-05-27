# 👩‍💼 Sarah

Conversational SDR assistant that guides sales teams through ICP definition, prospect campaign setup, email sequencing, follow-up scheduling, and reply review from a chat-first interface.

## Quick Start

```bash
git clone git@github.com:${GITHUB_OWNER}/sarah.git
cd sarah

# 1. Configure
cp .env.example .env
# Edit .env with your credentials (see "Required Environment Variables" below)

# 2. One-shot setup: validates env, installs deps, provisions DB, registers cron
chmod +x setup.sh
./setup.sh
```

## Manual Setup (if you prefer step-by-step)

```bash
cp .env.example .env             # then edit it
set -a; source .env; set +a       # load vars into the current shell
bash check-environment.sh         # verify everything required is set
bash install-dependencies.sh      # pip install psycopg2-binary, pyyaml
python3 scripts/data_writer.py provision   # create tables in your schema
openclaw cron add --file cron/campaign-sequence-send.json
openclaw cron add --file cron/campaign-follow-up-send.json
openclaw cron add --file cron/email-reply-received.json
```

## Running

```bash
bash test-workflow.sh             # run every skill in order locally (smoke test)
openclaw cron run --name campaign-sequence-send    # trigger manually
openclaw cron run --name campaign-follow-up-send    # trigger manually
openclaw cron run --name email-reply-received    # trigger manually
openclaw cron list                # see registered jobs
openclaw cron runs                # see run history
```

## Required Environment Variables

| Variable | Description |
|----------|-------------|
| `PLATFORM_PROSPECT_DB_URL` | Platform prospect database URL |
| `EMAIL_API_BASE_URL` | Email API base URL |
| `EMAIL_API_KEY` | Email API key |
| `SLACK_BOT_TOKEN` | Slack bot token |

## Skills

| Skill | Mode | Description |
|-------|------|-------------|
| `data-writer` | Auto | Provision, write, and query the agent database schema via scripts/data_writer.py. Use for all PostgreSQL operations and any result-table persistence. |
| `result-query` | User-invocable | Read stored records from the agent result tables for inspection and follow-up questions. |
| `github-action` | User-invocable | Git branch + PR workflow for syncing agent changes to GitHub. Creates feature branches, commits changes, and opens pull requests against main. NEVER pushes to main directly. MANDATORY for every agent. |
| `guide-campaign-setup` | Auto | Collect ICP, sequence, timing, and campaign details through dashboard or Slack conversation. |
| `validate-campaign-artifact` | Auto | Validate and normalize the SDR campaign artifact. |
| `manage-prospect-approval` | Auto | Prepare prospect-list changes for human approval and persist only approved prospects. |
| `generate-email-sequence` | Auto | Create approved SDR sequence content from campaign, ICP, and prospect context. |
| `schedule-campaign-actions` | Auto | Create send and follow-up schedule actions from approved sequence timing. |
| `send-campaign-email` | Auto | Send scheduled approved sequence emails through the Email API and store send status. |
| `capture-email-replies` | Auto | Capture Email API replies and store reply history for review. |
| `review-replies` | Auto | Summarize captured replies and prepare dashboard or Slack next-step prompts. |

## Scheduled Jobs

| Job Name | Schedule | Notes |
|----------|----------|-------|
| `campaign-sequence-send` | `0 * * * *` | Timezone: UTC |
| `campaign-follow-up-send` | `0 * * * *` | Timezone: UTC |
| `email-reply-received` | `*/5 * * * *` | Timezone: UTC |


## Architecture

- **Runtime**: OpenClaw AI agent framework
- **Data Layer**: PostgreSQL via `scripts/data_writer.py`
- **Scheduling**: OpenClaw cron
- **Schema**: `org_{org_id}_a_sarah`

## Directory Structure

```
sarah/
├── README.md
├── openclaw.json
├── result-schema.yml
├── env-manifest.yml
├── .env.example
├── requirements.txt
├── .gitignore
├── check-environment.sh
├── install-dependencies.sh
├── test-workflow.sh
├── cron/
├── workflows/
├── scripts/
│   ├── data_writer.py
│   └── github_action.py
├── skills/
└── workspace/
    ├── SOUL.md
    ├── 01_IDENTITY.md
    ├── 02_RULES.md
    ├── 03_SKILLS.md
    ├── 04_TRIGGERS.md
    ├── 05_ACCESS.md
    ├── 06_WORKFLOW.md
    └── 07_REVIEW.md
```
