#!/usr/bin/env bash
set -euo pipefail

INPUT_FILE="${INPUT_FILE:-/dev/stdin}"
OUTPUT_FILE="${OUTPUT_FILE:-/tmp/manage-prospect-approval_${RUN_ID}.json}"
PROJECT_ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)}"
export INPUT_FILE OUTPUT_FILE PROJECT_ROOT SKILL_ID="manage-prospect-approval"
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
    for key_name in ("PLATFORM_PROSPECT_DB_API_KEY", "PG_CONNECTION_STRING"):
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
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8", "replace")
            if resp.status < 200 or resp.status >= 300:
                raise SystemExit(f"Platform prospect database request failed with HTTP {resp.status}: {redact(raw)}")
            return json.loads(raw) if raw.strip() else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", "replace")
        raise SystemExit(f"Platform prospect database request failed with HTTP {exc.code}: {redact(raw)}")
    except urllib.error.URLError as exc:
        raise SystemExit(f"Platform prospect database request failed: {redact(exc.reason)}")


def extract_prospects(response):
    if isinstance(response, list):
        return response
    if not isinstance(response, dict):
        return []
    for key in ("prospects", "candidates", "results", "records", "data"):
        value = response.get(key)
        if isinstance(value, list):
            return value
        if isinstance(value, dict) and isinstance(value.get("prospects"), list):
            return value["prospects"]
    return []


def safe_profile(p):
    profile = p.get("profile") if isinstance(p.get("profile"), dict) else {}
    allowed = {"title", "job_title", "role", "industry", "location", "fit_reasons", "source_id", "tags"}
    clean = {k: v for k, v in profile.items() if k in allowed}
    for k in allowed:
        if k in p and k not in clean:
            clean[k] = p[k]
    return clean


def prospect_row(p, campaign_id, is_approved):
    email = first(p.get("email"), p.get("work_email"), p.get("contact_email"), default="")
    name = first(p.get("name"), " ".join(x for x in [p.get("first_name", ""), p.get("last_name", "")] if x).strip(), default="")
    company = first(p.get("company"), p.get("account"), p.get("organization"), default="")
    pid = first(p.get("id"), p.get("prospect_id"), stable_id("prospect", campaign_id, email, name, company))
    return {
        "id": pid,
        "campaign_id": campaign_id,
        "email": email,
        "name": name,
        "company": company,
        "profile": safe_profile(p),
        "approval_status": "approved" if is_approved else "pending",
        "created_at": first(p.get("created_at"), now()),
        "updated_at": now(),
    }


def nested_payloads(payload):
    items = []
    seen = set()
    keys = ("payload", "input", "output", "approval_input", "approval_payload", "prepared_output", "original_output")

    def add(value, depth=0):
        if not isinstance(value, dict) or depth > 3 or id(value) in seen:
            return
        seen.add(id(value))
        items.append(value)
        for key in keys:
            add(value.get(key), depth + 1)

    add(payload)
    return items or [{}]


def pick(payloads, *keys, default=None):
    for p in payloads:
        for key in keys:
            if isinstance(p, dict) and p.get(key) not in (None, "", [], {}):
                return p.get(key)
    return default


payload = load_payload(input_file)
payloads = nested_payloads(payload)
artifact = pick(payloads, "artifact", "campaign_artifact", "normalized_artifact", "configuration", default={}) or {}
if not isinstance(artifact, dict):
    artifact = {}

campaign_id = first(
    pick(payloads, "campaign_id"),
    artifact.get("campaign_id"),
    artifact.get("id"),
    default=stable_id("campaign", run_id or now()),
)
icp = first(pick(payloads, "icp", "criteria"), artifact.get("icp"), default={})
value_proposition = first(pick(payloads, "value_proposition"), artifact.get("value_proposition"), artifact.get("positioning"))
sequence_requirements = first(pick(payloads, "sequence_requirements"), artifact.get("sequence_requirements"), default={})
timing = first(pick(payloads, "timing"), artifact.get("timing"), default={})

normalized_artifact = dict(artifact)
normalized_artifact["campaign_id"] = campaign_id
if icp:
    normalized_artifact["icp"] = icp
if value_proposition:
    normalized_artifact["value_proposition"] = value_proposition
if sequence_requirements:
    normalized_artifact["sequence_requirements"] = sequence_requirements
if timing:
    normalized_artifact["timing"] = timing

is_approved = approved(first(
    pick(payloads, "approval_status"),
    pick(payloads, "prospect_list_approval"),
    pick(payloads, "approved"),
    pick(payloads, "status"),
))

reviewed = as_list(first(
    pick(payloads, "approved_prospects"),
    pick(payloads, "held_changes"),
    pick(payloads, "prospects", "proposed_prospects"),
    normalized_artifact.get("approved_prospects"),
    default=[],
))
reviewed = [p for p in reviewed if isinstance(p, dict)]

retrieval_request = None
retrieval_source = "reviewed_held_changes" if is_approved and reviewed else "platform_prospect_database"
retrieval = pick(payloads, "retrieval", default={}) or {}
if isinstance(retrieval, dict):
    retrieval_request = retrieval.get("requested")

if is_approved and reviewed:
    raw_prospects = reviewed
else:
    if not icp:
        raise SystemExit("Prospect retrieval needs ICP criteria from the validated campaign artifact.")
    base = os.environ.get("PLATFORM_PROSPECT_DB_URL", "").rstrip("/")
    api_key = os.environ.get("PLATFORM_PROSPECT_DB_API_KEY", "")
    if not base:
        raise SystemExit("Platform prospect database settings are missing. Set PLATFORM_PROSPECT_DB_URL before running this step.")
    retrieval_request = {
        "campaign_id": campaign_id,
        "campaign_name": first(normalized_artifact.get("name"), normalized_artifact.get("campaign_name"), pick(payloads, "campaign_name")),
        "icp": icp,
        "value_proposition": value_proposition,
        "limit": int(first(pick(payloads, "prospect_limit"), normalized_artifact.get("prospect_limit"), default=25)),
        "source_policy": "approved_platform_database_only",
    }
    response = post_json(f"{base}/prospects/search", retrieval_request, api_key)
    raw_prospects = [p for p in extract_prospects(response) if isinstance(p, dict)]

rows = [prospect_row(p, campaign_id, is_approved) for p in raw_prospects]
# Keep only contact data needed for outreach; skip records without an email address.
rows = [r for r in rows if r.get("email")]

if is_approved and not rows:
    raise SystemExit("Approved prospect persistence needs the reviewed prospect list from the approval step.")

db = [write_db("result_prospects", rows)] if is_approved else []
result = {
    "skill_id": skill_id,
    "run_id": run_id,
    "status": "approved" if is_approved else "pending_approval",
    "created_at": now(),
    "campaign_id": campaign_id,
    "artifact": normalized_artifact,
    "campaign_artifact": normalized_artifact,
    "normalized_artifact": normalized_artifact,
    "icp": icp,
    "value_proposition": value_proposition,
    "sequence_requirements": sequence_requirements,
    "timing": timing,
    "retrieval": {"source": retrieval_source, "requested": retrieval_request, "returned_count": len(rows)},
    "approved_prospects": rows if is_approved else [],
    "held_changes": [] if is_approved else rows,
    "approval_prompt": "Please review and approve the prospect list before changes are applied.",
}
if not rows:
    result["status"] = "no_prospects_found"
    result["approval_prompt"] = "No matching prospects were found in the approved platform prospect database. Please update the ICP and try again."
if db:
    result["db_writes"] = db
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(result, f, indent=2)
    f.write("\n")
PY
