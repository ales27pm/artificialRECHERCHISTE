#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

abort() { echo "[post-session][ERR] $*" >&2; exit 1; }

command -v python3 >/dev/null || abort "python3 required"
command -v git >/dev/null || abort "git required"
git rev-parse --is-inside-work-tree >/dev/null || abort "not a git repo"

TS="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
SESSION_ID="$(uuidgen 2>/dev/null || python3 - <<'PY'
import uuid; print(uuid.uuid4())
PY
)"

echo "[post-session] Pre-flight static checks (best-effort)..."
# Python lint (ruff/flake8) if present
if command -v ruff >/dev/null 2>&1; then ruff . || true; elif command -v flake8 >/dev/null 2>&1; then flake8 || true; fi
# Python tests if pytest present
if command -v pytest >/dev/null 2>&1; then pytest -q || true; fi
# Node lint/tests if present
if [ -f package.json ]; then
  if jq -e '.scripts.lint' package.json >/dev/null 2>&1; then npm run lint || true; fi
  if jq -e '.scripts.test' package.json >/dev/null 2>&1; then npm test --silent || true; fi
fi
# Go tests if go.mod exists
if [ -f go.mod ]; then go test ./... || true; fi
# Cargo tests if Cargo.toml exists
if [ -f Cargo.toml ]; then cargo test --all --quiet || true; fi

echo "[post-session] Scan + validate..."
python3 scripts/agent_scan.py --refresh-index --validate || {
  fn=".agents/alerts/${TS}.json"
  echo "{"when":"${TS}","session_id":"${SESSION_ID}","reason":"scan_validate_failed"}" > "$fn"
  abort "scan/validate failed (alert: $fn)"
}

echo "[post-session] Snapshot..."
SNAP=".agents/snapshots/${TS}.json"
python3 - <<PY
import json,subprocess,sys,os,time
from pathlib import Path
snap={"ts":"$TS","session_id":"$SESSION_ID"}
try:
    h=subprocess.check_output(["git","rev-parse","HEAD"]).decode().strip()
    snap["git_head"]=h
except Exception as e:
    snap["git_head_error"]=str(e)
def read_json(p):
    try:
        with open(p,"r",encoding="utf-8") as fh: return json.load(fh)
    except Exception as e:
        return {"error": str(e)}
for f in [".agents/index.json",".agents/priorities.json",".agents/metrics.json"]:
    snap[f]=read_json(f)
Path("$SNAP").write_text(json.dumps(snap,indent=2),encoding="utf-8")
print("[snapshot] wrote", "$SNAP")
PY

echo "[post-session] Git add/commit..."
git add -A
if ! git diff --cached --quiet; then
  git commit -m "agent: post-session update @ ${TS}" -m "Runbook: scripts/agent_post_session_update.sh"
else
  echo "[post-session] No changes to commit."
fi

echo "[post-session] Push (with retries + ledger)..."
RETRIES=3
PUSH_OK=0
PUSH_ATTEMPTED=0
PUSH_SKIPPED=0
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  for i in $(seq 1 $RETRIES); do
    PUSH_ATTEMPTED=1
    if git push; then
      echo "[post-session] Pushed successfully."
      PUSH_OK=1
      break
    fi
    echo "[post-session] Push failed (attempt $i/$RETRIES). Retrying in 3s..."
    sleep 3
  done
else
  echo "[post-session] No upstream configured; skipping push."
  PUSH_OK=1
  PUSH_SKIPPED=1
fi

LEDGER_EXIT=0
LEDGER_NOTES_JSON="[]"
if [ "$PUSH_SKIPPED" -eq 1 ]; then
  LEDGER_NOTES_JSON='["push_skipped_no_upstream"]'
fi
if [ "$PUSH_OK" -ne 1 ]; then
  LEDGER_EXIT=1
  if [ "$LEDGER_NOTES_JSON" = "[]" ]; then
    LEDGER_NOTES_JSON='["git_push_failed"]'
  else
    LEDGER_NOTES_JSON='["push_skipped_no_upstream","git_push_failed"]'
  fi
fi

export TS SESSION_ID LEDGER_EXIT LEDGER_NOTES_JSON
python3 - <<'PY'
import json, os
from pathlib import Path

ts = os.environ["TS"]
sid = os.environ["SESSION_ID"]
exit_code = int(os.environ.get("LEDGER_EXIT", "0"))
notes = json.loads(os.environ.get("LEDGER_NOTES_JSON", "[]"))
payload = {"ts": ts, "session_id": sid, "exit_code": exit_code, "notes": notes}
Path(f".agents/ledger/{ts}.json").write_text(json.dumps(payload, indent=2), encoding="utf-8")
print(f"[ledger] wrote .agents/ledger/{ts}.json")
PY

if [ "$PUSH_ATTEMPTED" -eq 1 ] && [ "$PUSH_OK" -ne 1 ]; then
  FN=".agents/alerts/${TS}.json"
  echo "{"when":"${TS}","session_id":"${SESSION_ID}","reason":"git_push_failed","attempts":${RETRIES}}" > "$FN"
  abort "Push failed; alert recorded: $FN"
fi

# Metrics update (success)
python3 - <<'PY'
import json, time
from pathlib import Path
m=Path(".agents/metrics.json")
try:
  j=json.loads(m.read_text(encoding="utf-8"))
except Exception:
  j={"version":1}
j["sessions_total"]=j.get("sessions_total",0)+1
j["updated_at"]=time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime())
m.write_text(json.dumps(j,indent=2),encoding="utf-8")
print("[metrics] updated")
PY

echo "[post-session] Done."
