#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${INPUT_FILE:-/dev/stdin}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/generate-email-sequence_${RUN_ID}.json}"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)}"
export INPUT_FILE OUTPUT_FILE PROJECT_ROOT SKILL_ID="generate-email-sequence"
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
    text = str(text or "")
    for key_name in ("PLATFORM_EMAIL_GENERATOR_API_KEY", "PG_CONNECTION_STRING"):
        secret = os.environ.get(key_name, "")
        if secret:
            text = text.replace(secret, "[redacted]")
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
    cmd = ["python3", writer, "--table", table, "--conflict-columns", "id", "--input", tmp]
    try:
        subprocess.run(cmd, check=True, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return {"table": table, "rows": len(rows), "status": "written"}
    except subprocess.CalledProcessError as exc:
        return {"table": table, "rows": len(rows), "status": "failed", "error": redact(exc.stderr or exc.stdout or "write failed")}


def post_json(url, body, api_key=""):
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), method="POST", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw = resp.read().decode("utf-8", "replace")
            if resp.status < 200 or resp.status >= 300:
                raise SystemExit(f"Platform email generator request failed with HTTP {resp.status}: {redact(raw)}")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        raise SystemExit(f"Platform email generator request failed with HTTP {exc.code}: {redact(raw)}")
    except urllib.error.URLError as exc:
        raise SystemExit(f"Platform email generator request failed: {redact(exc.reason)}")


def extract_sequence(response):
    if isinstance(response, list):
        return response
    if not isinstance(response, dict):
        return []
    for key in ("sequence", "email_sequence", "steps", "messages", "data"):
        value = response.get(key)
        if isinstance(value, list):
            return value
        if isinstance(value, dict):
            nested = extract_sequence(value)
            if nested:
                return nested
    return []


def prospect_summary(prospects):
    clean = []
    for p in prospects[:5]:
        if not isinstance(p, dict):
            continue
        name = first(p.get("name"), default="a prospect")
        company = first(p.get("company"), default="their company")
        profile = p.get("profile") if isinstance(p.get("profile"), dict) else {}
        role = first(profile.get("title"), profile.get("job_title"), profile.get("role"), default="target buyer")
        clean.append({"name": name, "company": company, "role": role})
    return clean


def supplied_sequence(payload, artifact):
    seq = as_list(first(payload.get("generated_sequence"), payload.get("sequence"), payload.get("email_sequence"), artifact.get("generated_sequence"), artifact.get("sequence"), default=[]))
    valid = []
    for s in seq:
        if isinstance(s, dict) and first(s.get("subject"), s.get("body")):
            valid.append(s)
    return valid


def local_generate(context):
    campaign = context["campaign"]
    icp = context["icp"]
    timing = context["timing"]
    value = context["value_proposition"]
    req = context["sequence_requirements"]
    prospects = context["prospect_context"]
    audience = first(icp.get("audience") if isinstance(icp, dict) else None, icp.get("role") if isinstance(icp, dict) else None, icp.get("persona") if isinstance(icp, dict) else None, default="your team")
    industry = first(icp.get("industry") if isinstance(icp, dict) else None, icp.get("market") if isinstance(icp, dict) else None, default="your market")
    sample = prospects[0] if prospects else {"company": "your company", "role": "your team"}
    cadence = req.get("cadence") if isinstance(req, dict) else None
    tone = first(req.get("tone") if isinstance(req, dict) else None, default="concise and helpful")
    return [
        {
            "step_number": 1,
            "subject": f"Idea for {sample['company']} and {industry}",
            "body": f"Hi {{name}},\n\nI noticed {sample['company']} matches our campaign focus for {audience}. Sarah is helping our team reach companies where {value}.\n\nWould it be useful to compare notes on whether this could help {sample['role']} this quarter?\n\nBest,\n{{sender_name}}",
            "timing": timing if isinstance(timing, dict) else {"cadence": cadence or timing},
            "generation_notes": f"Built from approved campaign '{campaign}', ICP, value proposition, and approved prospect context. Tone: {tone}.",
        },
        {
            "step_number": 2,
            "subject": f"Following up on {campaign}",
            "body": f"Hi {{name}},\n\nFollowing up because the campaign ICP points to teams dealing with priorities in {industry}. The reason I reached out is simple: {value}.\n\nIf this is relevant, I can send a short example tailored to {{company}}. If not, just let me know and I will close the loop.\n\nBest,\n{{sender_name}}",
            "timing": {"offset_days": 3, "cadence": cadence or "follow up after the first email"},
            "generation_notes": "Follow-up uses the same approved ICP and avoids adding new claims.",
        },
        {
            "step_number": 3,
            "subject": "Should I close the loop?",
            "body": f"Hi {{name}},\n\nI do not want to crowd your inbox. Should I close the loop, or is there someone better to ask about {value} for {{company}}?\n\nThanks,\n{{sender_name}}",
            "timing": {"offset_days": 7, "cadence": cadence or "final polite follow-up"},
            "generation_notes": "Final step is brief and gives the prospect an easy opt-out.",
        },
    ]


payload = load_payload(input_file)
artifact = first(payload.get("artifact"), payload.get("campaign_artifact"), payload.get("normalized_artifact"), payload.get("configuration"), default={}) or {}
campaign_id = first(payload.get("campaign_id"), artifact.get("campaign_id"), artifact.get("id"), default=stable_id("campaign", run_id or now()))
name = first(artifact.get("name"), artifact.get("campaign_name"), payload.get("campaign_name"), default="Untitled SDR campaign")
icp = first(payload.get("icp"), payload.get("criteria"), artifact.get("icp"), default={})
value_prop = first(payload.get("value_proposition"), artifact.get("value_proposition"), artifact.get("positioning"))
sequence_requirements = first(payload.get("sequence_requirements"), artifact.get("sequence_requirements"), default={})
timing = first(payload.get("timing"), artifact.get("timing"), default={})
prospects = as_list(first(payload.get("approved_prospects"), payload.get("prospects"), artifact.get("approved_prospects"), default=[]))
prospects = [p for p in prospects if isinstance(p, dict) and approved(first(p.get("approval_status"), "approved"))]

seq = supplied_sequence(payload, artifact)
generation_source = "supplied_generated_content" if seq else ""
if not seq:
    generator_url = os.environ.get("PLATFORM_EMAIL_GENERATOR_URL", "").rstrip("/")
    generator_key = os.environ.get("PLATFORM_EMAIL_GENERATOR_API_KEY", "")
    missing = []
    if not artifact:
        missing.append("approved campaign artifact")
    if not icp:
        missing.append("ICP criteria")
    if not value_prop:
        missing.append("value proposition")
    if not sequence_requirements:
        missing.append("sequence requirements")
    if not timing:
        missing.append("campaign timing")
    if not prospects:
        missing.append("approved prospect context")
    if missing:
        raise SystemExit("Email sequence generation needs " + ", ".join(missing) + ", or supplied generated sequence content with subject and body.")
    context = {
        "campaign_id": campaign_id,
        "campaign": name,
        "campaign_artifact": artifact,
        "icp": icp,
        "value_proposition": value_prop,
        "sequence_requirements": sequence_requirements,
        "timing": timing,
        "prospect_context": prospect_summary(prospects),
        "policy": "approved_campaign_and_prospect_context_only",
    }
    if generator_url:
        seq = extract_sequence(post_json(f"{generator_url}/email-sequences/generate", context, generator_key))
        generation_source = "platform_email_generator"
        if not seq:
            raise SystemExit("Platform email generator did not return sequence steps with subject and body.")
    else:
        seq = local_generate(context)
        generation_source = "campaign_context_generator"

is_approved = approved(first(payload.get("sequence_approval"), payload.get("approval_status"), payload.get("approved")))
rows = []
for i, s in enumerate(seq, 1):
    if not isinstance(s, dict):
        continue
    subject = first(s.get("subject"), default="")
    body = first(s.get("body"), s.get("email_body"), default="")
    if not subject or not body:
        raise SystemExit("Each generated sequence step needs a subject and body before review.")
    rows.append({
        "id": first(s.get("id"), stable_id("sequence", campaign_id, i, subject)),
        "campaign_id": campaign_id,
        "step_number": int(first(s.get("step_number"), s.get("step"), i)),
        "subject": subject,
        "body": body,
        "timing": first(s.get("timing"), timing, default={}),
        "approval_status": "approved" if is_approved else "pending",
        "created_at": now(),
        "updated_at": now(),
    })

if not rows:
    raise SystemExit("Email sequence generation did not produce usable sequence steps.")

db = [write_db("result_email_sequences", rows)] if is_approved else []
result = {
    "skill_id": skill_id,
    "run_id": run_id,
    "status": "approved" if is_approved else "pending_approval",
    "created_at": now(),
    "campaign_id": campaign_id,
    "generation_source": generation_source,
    "sequence": rows,
    "review_prompt": "Please review the generated sequence before Sarah schedules or sends it.",
}
if db:
    result["db_writes"] = db
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)
    f.write("\n")
PY
