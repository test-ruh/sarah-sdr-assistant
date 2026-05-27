#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${INPUT_FILE:-/dev/stdin}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/schedule-campaign-actions_${RUN_ID}.json}"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)}"
export INPUT_FILE OUTPUT_FILE PROJECT_ROOT SKILL_ID="schedule-campaign-actions"
mkdir -p "$(dirname "$OUTPUT_FILE")"

python3 - <<'PY'
import datetime, json, os, subprocess, sys, urllib.error, urllib.request, uuid

skill_id = os.environ["SKILL_ID"]
run_id = os.environ.get("RUN_ID", "")
input_file = os.environ.get("INPUT_FILE", "/dev/stdin")
output_file = os.environ["OUTPUT_FILE"]
project_root = os.environ.get("PROJECT_ROOT", os.getcwd())


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def load_payload(path):
    try:
        text = sys.stdin.read() if path == "/dev/stdin" else open(path, "r", encoding="utf-8").read()
    except FileNotFoundError:
        return {}
    if not text.strip():
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Input is not valid JSON: {exc.msg}")


def first(*values, default=None):
    for value in values:
        if value not in (None, "", [], {}):
            return value
    return default


def stable_id(prefix, *parts):
    raw = ":".join(str(p) for p in parts if p not in (None, "")) or str(uuid.uuid4())
    return str(uuid.uuid5(uuid.NAMESPACE_URL, prefix + ":" + raw))


def as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def approved(value):
    if isinstance(value, bool):
        return value
    return str(value or "").lower() in {"approved", "true", "yes"}


def redact(text):
    key = os.environ.get("EMAIL_API_KEY", "")
    if key:
        text = text.replace(key, "[redacted]")
    return text[:500]


def write_db(table, rows):
    rows = [r for r in as_list(rows) if isinstance(r, dict)]
    if not rows:
        return {"table": table, "rows": 0, "status": "skipped"}
    if not os.environ.get("PG_CONNECTION_STRING"):
        return {"table": table, "rows": len(rows), "status": "skipped", "reason": "PG_CONNECTION_STRING is not set"}
    writer = os.path.join(project_root, "scripts", "data_writer.py")
    if not os.path.exists(writer):
        return {"table": table, "rows": len(rows), "status": "skipped", "reason": "data_writer.py was not found"}
    tmp = os.path.join("/tmp", f"{skill_id}_{table}_{run_id or 'run'}.json")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump({"table": table, "conflict_columns": ["id"], "rows": rows}, f)
    env = dict(os.environ)
    env["PG_CONNECTION_STRING"] = os.environ["PG_CONNECTION_STRING"]
    cmd = ["python3", writer, "--table", table, "--conflict-columns", "id", "--input", tmp]
    try:
        subprocess.run(cmd, check=True, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return {"table": table, "rows": len(rows), "status": "written"}
    except subprocess.CalledProcessError as exc:
        return {"table": table, "rows": len(rows), "status": "failed", "error": redact((exc.stderr or exc.stdout or "write failed"))}


def email_api(path, body=None, method="POST"):
    base = os.environ.get("EMAIL_API_BASE_URL", "").rstrip("/")
    key = os.environ.get("EMAIL_API_KEY", "")
    if not base or not key:
        raise SystemExit("Email API settings are missing. Set EMAIL_API_BASE_URL and EMAIL_API_KEY before running this step.")
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(base + path, data=data, method=method, headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8", "replace")
            if resp.status < 200 or resp.status >= 300:
                raise SystemExit(f"Email API request failed with HTTP {resp.status}: {redact(raw)}")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        raise SystemExit(f"Email API request failed with HTTP {exc.code}: {redact(raw)}")

payload = load_payload(input_file)
artifact = first(payload.get("artifact"), payload.get("campaign_artifact"), payload.get("normalized_artifact"), payload.get("configuration"), default={}) or {}
campaign_id = first(payload.get("campaign_id"), artifact.get("campaign_id"), artifact.get("id"), default=stable_id("campaign", run_id or now()))
name = first(artifact.get("name"), artifact.get("campaign_name"), payload.get("campaign_name"), default="Untitled SDR campaign")
status = "ready"
db = []
result = {"skill_id": skill_id, "run_id": run_id, "status": status, "created_at": now()}

if skill_id == "guide-campaign-setup":
    required = ["name", "icp", "sequence_requirements", "timing"]
    missing = [k for k in required if not first(artifact.get(k), payload.get(k))]
    updated = dict(artifact)
    for k in required:
        if payload.get(k) is not None:
            updated[k] = payload[k]
    questions = [f"Please share the campaign {m.replace('_', ' ')}." for m in missing]
    result.update({"status": "needs_input" if missing else "ready", "artifact": updated, "missing_fields": missing, "follow_up_questions": questions, "notifications": [{"channel": payload.get("channel", "active_conversation"), "message": questions[0] if questions else "Campaign details are ready for validation."}]})

elif skill_id == "validate-campaign-artifact":
    errors = []
    for k in ["icp", "sequence_requirements", "timing"]:
        if not artifact.get(k): errors.append(f"Missing {k.replace('_', ' ')}")
    normalized = dict(artifact, id=campaign_id, name=name, status="validated" if not errors else "needs_input")
    campaign_row = {"id": campaign_id, "name": name, "status": normalized["status"], "owner_context": payload.get("owner_context", {}), "configuration": normalized, "created_at": now(), "updated_at": now()}
    icp_row = {"id": stable_id("icp", campaign_id), "campaign_id": campaign_id, "criteria": normalized.get("icp", {}), "validation_status": "valid" if not errors else "invalid", "created_at": now(), "updated_at": now()}
    db = [write_db("result_campaigns", [campaign_row]), write_db("result_icp_criteria", [icp_row])]
    result.update({"status": "valid" if not errors else "invalid", "valid": not errors, "errors": errors, "normalized_artifact": normalized, "campaign": campaign_row, "icp_criteria": icp_row})

elif skill_id == "manage-prospect-approval":
    prospects = as_list(first(payload.get("prospects"), payload.get("proposed_prospects"), artifact.get("prospects"), default=[]))
    is_approved = approved(first(payload.get("approval_status"), payload.get("prospect_list_approval"), payload.get("approved")))
    rows = []
    for p in prospects:
        if not isinstance(p, dict): continue
        pid = first(p.get("id"), stable_id("prospect", campaign_id, p.get("email"), p.get("name")))
        rows.append({"id": pid, "campaign_id": campaign_id, "email": p.get("email", ""), "name": p.get("name", ""), "company": p.get("company", ""), "profile": p.get("profile", p), "approval_status": "approved" if is_approved else "pending", "created_at": now(), "updated_at": now()})
    if is_approved: db = [write_db("result_prospects", rows)]
    result.update({"status": "approved" if is_approved else "pending_approval", "campaign_id": campaign_id, "approved_prospects": rows if is_approved else [], "held_changes": [] if is_approved else rows, "approval_prompt": "Please review and approve the prospect list before changes are applied."})

elif skill_id == "generate-email-sequence":
    is_approved = approved(first(payload.get("sequence_approval"), payload.get("approval_status"), payload.get("approved")))
    seq = as_list(first(payload.get("sequence"), payload.get("email_sequence"), artifact.get("sequence"), default=[]))
    if not seq:
        seq = [{"step_number": 1, "subject": f"Quick question about {name}", "body": "Please review this draft before sending.", "timing": artifact.get("timing", {})}]
    rows=[]
    for i,s in enumerate(seq,1):
        rows.append({"id": first(s.get("id") if isinstance(s,dict) else None, stable_id("sequence", campaign_id, i)), "campaign_id": campaign_id, "step_number": int(first(s.get("step_number") if isinstance(s,dict) else None, i)), "subject": (s or {}).get("subject", ""), "body": (s or {}).get("body", ""), "timing": (s or {}).get("timing", artifact.get("timing", {})), "approval_status": "approved" if is_approved else "pending", "created_at": now(), "updated_at": now()})
    if is_approved: db=[write_db("result_email_sequences", rows)]
    result.update({"status":"approved" if is_approved else "pending_approval", "campaign_id":campaign_id, "sequence":rows, "review_prompt":"Please review the sequence before Sarah schedules or sends it."})

elif skill_id == "schedule-campaign-actions":
    seq = as_list(first(payload.get("sequence"), payload.get("email_sequence"), default=[]))
    prospects = as_list(first(payload.get("approved_prospects"), payload.get("prospects"), default=[]))
    is_approved = approved(first(payload.get("sequence_approval"), payload.get("approval_status"), "approved"))
    rows=[]
    for p in prospects or [{}]:
        for s in seq or [{}]:
            sid = first((s or {}).get("id"), (s or {}).get("sequence_id"), stable_id("sequence", campaign_id, (s or {}).get("step_number", 1)))
            pid = first((p or {}).get("id"), (p or {}).get("prospect_id"), stable_id("prospect", campaign_id, (p or {}).get("email", "prospect")))
            rows.append({"id": stable_id("scheduled", campaign_id, pid, sid), "campaign_id": campaign_id, "prospect_id": pid, "sequence_id": sid, "action_type": "send" if int((s or {}).get("step_number", 1)) == 1 else "follow_up", "scheduled_at": first((s or {}).get("scheduled_at"), (s or {}).get("timing", {}).get("scheduled_at") if isinstance((s or {}).get("timing"), dict) else None, artifact.get("scheduled_at"), now()), "status": "scheduled" if is_approved else "pending_approval", "created_at": now(), "updated_at": now()})
    if is_approved: db=[write_db("result_scheduled_actions", rows)]
    result.update({"status":"scheduled" if is_approved else "pending_approval", "campaign_id":campaign_id, "scheduled_actions":rows, "trigger_payloads":rows})

elif skill_id == "send-campaign-email":
    if not approved(first(payload.get("sequence_approval"), payload.get("approval_status"), payload.get("approved"), "approved")):
        raise SystemExit("This email is not approved for sending yet.")
    prospect = first(payload.get("prospect"), payload.get("approved_prospect"), default={}) or {}
    sequence = first(payload.get("sequence_step"), payload.get("sequence"), default={}) or {}
    if isinstance(sequence, list): sequence = sequence[0] if sequence else {}
    to_email = first(payload.get("to"), prospect.get("email"))
    subject = first(payload.get("subject"), sequence.get("subject"))
    body = first(payload.get("body"), sequence.get("body"))
    if not to_email or not subject or not body:
        raise SystemExit("Email send needs a prospect email, subject, and body.")
    api_resp = email_api("/send", {"to": to_email, "subject": subject, "body": body, "campaign_id": campaign_id, "prospect_id": prospect.get("id"), "scheduled_action_id": payload.get("scheduled_action_id")})
    msg_id = first(api_resp.get("message_id"), api_resp.get("id"), default=stable_id("email-message", campaign_id, to_email, now()))
    row = {"id": stable_id("send", campaign_id, payload.get("scheduled_action_id"), msg_id), "campaign_id": campaign_id, "prospect_id": first(prospect.get("id"), payload.get("prospect_id")), "sequence_id": first(sequence.get("id"), payload.get("sequence_id")), "scheduled_action_id": payload.get("scheduled_action_id"), "email_api_message_id": msg_id, "send_status": first(api_resp.get("status"), "sent"), "sent_at": now(), "metadata": {k:v for k,v in api_resp.items() if k not in {"api_key", "token"}}}
    db=[write_db("result_outbound_sends", [row])]
    result.update({"status":"sent", "campaign_id":campaign_id, "email_api_message_id":msg_id, "outbound_send":row})

elif skill_id == "capture-email-replies":
    reply = dict(payload)
    if payload.get("reply_id") and not payload.get("reply_body"):
        reply.update(email_api(f"/replies/{payload['reply_id']}", None, "GET"))
    reply_id = first(reply.get("email_api_reply_id"), reply.get("reply_id"), reply.get("id"), default=stable_id("reply", campaign_id, reply.get("message_id"), now()))
    row = {"id": stable_id("reply-row", reply_id), "campaign_id": campaign_id, "prospect_id": first(reply.get("prospect_id"), payload.get("prospect_id")), "outbound_send_id": first(reply.get("outbound_send_id"), payload.get("outbound_send_id")), "email_api_reply_id": reply_id, "reply_body": first(reply.get("reply_body"), reply.get("body"), ""), "received_at": first(reply.get("received_at"), reply.get("received_time"), now()), "review_status": "needs_review", "created_at": now()}
    db=[write_db("result_replies", [row])]
    result.update({"status":"captured", "campaign_id":campaign_id, "reply":row, "review_status":"needs_review", "notifications":[{"channel":"slack", "message":"A prospect replied. Please review the reply and choose the next step."}]})

elif skill_id == "review-replies":
    replies = as_list(first(payload.get("replies"), payload.get("reply"), default=[]))
    count = len([r for r in replies if isinstance(r, dict)])
    prompt = "Review the captured reply and choose the next step." if count == 1 else f"Review {count} captured replies and choose next steps."
    result.update({"status":"needs_review", "campaign_id":campaign_id, "reply_count":count, "summary":prompt, "next_step_prompt":prompt, "notifications":[{"channel":"slack", "message":prompt}]})

else:
    raise SystemExit(f"Unknown skill: {skill_id}")

if db:
    result["db_writes"] = db
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)
    f.write("\n")
PY
