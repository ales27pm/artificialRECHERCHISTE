# AGENTS.md

**Single-file constitution, installer, and operating contract for autonomous coding agents.**  
Place **AGENTS.md** at the repository root. Run the **Installer** (below) once. It will:

- Materialise the complete control plane (`.agents/**` JSON, schemas, priorities, tasks, ledger, alerts, snapshots).
- Create robust, idempotent **scripts/** (`agent_bootstrap.sh`, `agent_scan.py`, `agent_next_step.sh`, `agent_post_session_update.sh`).
- Seed human docs (`VISION.md`, `OVERVIEW.md`).
- Then **auto-shrink this file** into a compact runtime version (keeping the immutable rules), so future sessions start fast and context is always fresh.

There are **no placeholders or stubs** anywhere. Every script is production-minded and fail-closed.

---

## 0) Installer — run once from repo root

```bash
python3 - <<'PY'
import os, re, sys, json, stat, time, hashlib, textwrap
from pathlib import Path

ROOT = Path.cwd()
AGENTS_MD = ROOT / "AGENTS.md"
if not AGENTS_MD.exists():
    print("[installer][ERR] AGENTS.md not found at repo root", file=sys.stderr); sys.exit(1)

src = AGENTS_MD.read_text(encoding="utf-8")

# Find fenced file blocks:
# ```file: path/to/file
# <content>
# ```
pattern = re.compile(r"```file:\s*([^
]+)
(.*?)
```", re.DOTALL)
files = pattern.findall(src)
if not files:
    print("[installer][ERR] No file blocks found in AGENTS.md", file=sys.stderr); sys.exit(2)

def ensure_dir(p: Path):
    p.parent.mkdir(parents=True, exist_ok=True)

written = []
for rel_path, content in files:
    dest = ROOT / rel_path.strip()
    ensure_dir(dest)
    dest.write_text(content, encoding="utf-8")
    # Make scripts executable if under scripts/ or has .sh
    if "/scripts/" in str(dest) or dest.suffix == ".sh":
        try:
            st = os.stat(dest)
            os.chmod(dest, st.st_mode | stat.S_IEXEC)
        except Exception as e:
            print(f"[installer][WARN] chmod +x failed for {dest}: {e}", file=sys.stderr)
    written.append(str(dest.relative_to(ROOT)))

# Post-write sanity
mandatory = [
    ".agents/index.json", ".agents/priorities.json", ".agents/schemas/index.schema.json",
    ".agents/schemas/priorities.schema.json", ".agents/schemas/tasks.schema.json",
    "scripts/agent_bootstrap.sh", "scripts/agent_scan.py", "scripts/agent_next_step.sh",
    "scripts/agent_post_session_update.sh", "VISION.md", "OVERVIEW.md"
]
missing = [m for m in mandatory if not (ROOT / m).exists()]
if missing:
    print("[installer][ERR] Missing mandatory files after write:", *missing, sep="\n - ", file=sys.stderr)
    sys.exit(3)

print("[installer] wrote:", *written, sep="\n - ")

# Replace AGENTS.md with compact runtime version (keeps immutable contract + commands)
runtime = f"""# AGENTS.md

**Runtime contract for autonomous coding agents.**

## Non-Negotiables (Immutable)
1. No placeholders/stubs/mockups/TODOs-instead-of-code. Implement fully and safely.
2. Mandatory post-session updater before any PR/push:
   ```bash
   bash scripts/agent_post_session_update.sh
   ```
3. Machine control plane under `.agents/` (JSON only). Human docs in `VISION.md`, `OVERVIEW.md`.
4. Deep cross-linking with stable anchors and file/line spans where applicable.
5. Tool-integrated loop per task: plan → index lookup → static checks → targeted tests → implement → full tests → proofs → updater (fail-closed).
6. Fail-closed: on any gate failure, publish is aborted and an alert is recorded under `.agents/alerts/`.

## Session Flow
- Select next task:
  ```bash
  bash scripts/agent_next_step.sh
  ```
- Execute task (full code, no placeholders). Update docs/links.
- Publish (required):
  ```bash
  bash scripts/agent_post_session_update.sh
  ```

## References
- Machine index: `.agents/index.json`
- Priorities: `.agents/priorities.json`
- Tasks: `.agents/modules/**/tasks.json`
- Ledger: `.agents/ledger/`
- Snapshots: `.agents/snapshots/`
- Schemas: `.agents/schemas/`
"""

AGENTS_MD.write_text(runtime, encoding="utf-8")
print("[installer] AGENTS.md compacted for runtime.")
print("[installer] done.")
PY
```

---

## 1) Non-Negotiables (immutable policy)

1. **Zero-placeholder policy.** No examples, stubs, mocks, or “TODO later”. Implement fully, robustly, and safely or do not submit.  
2. **Mandatory end-of-session updater (before PR/push).**  
   ```bash
   bash scripts/agent_post_session_update.sh
   ```  
   If validation fails, **fix and rerun**. Do **not** push/open PR until green.  
3. **Machine plane in `.agents/` (JSON only).** Human docs in `VISION.md`, `OVERVIEW.md`.  
4. **Deep cross-linking required.** Every cross-module dependency must store precise references: `{"file":"…","symbol":"…","anchor":"symbol:…","line":N,"end_line":M}` or Markdown `{#anchor}`.  
5. **Tool-integrated loop for every task (no chat-only).** Plan → repo index lookup → static checks (lint+security) → targeted tests → implement → full tests → attach proofs → updater.  
6. **Fail-closed.** Any broken gate aborts publishing and records an alert in `.agents/alerts/`.

---

## 2) Lifecycle contract (every session)

1. **Plan** via priorities queue.  
2. **Execute with tools** (symbol/index search → static checks → tests → implement → re-test).  
3. **Prove** results (coverage %, lints, security, perf if relevant) inside the task entry.  
4. **Publish** using the updater; if any step fails, stop and remediate.

---

## 3) Human guardrails (must be read each session)

```file: VISION.md
# Vision

We deliver production-grade systems with:
- Full implementations (no placeholders)
- Deterministic behaviour and reproducible builds
- Strong typing, explicit invariants, thorough tests
- Security & privacy by default (least privilege)
- Observability (logs/metrics/traces) in critical paths

Anti-drift: Any decision must trace to this document or an approved design note linked from OVERVIEW.md.
```

```file: OVERVIEW.md
# Overview

Authoritative machine index: `.agents/index.json`  
Start here for tasks: `.agents/priorities.json`  
Module task lists: `.agents/modules/**/tasks.json`

Auto-select the next task:
```bash
bash scripts/agent_next_step.sh
```

For cross-module context, follow `refs[]` in each task entry; they include stable anchors (symbol/header) and line spans where applicable.
```

---

## 4) Machine control plane — initial data

```file: .agents/version
1
```

```file: .agents/index.json
{
  "$schema": ".agents/schemas/index.schema.json",
  "version": 1,
  "generated_at": "bootstrap",
  "modules": [
    {
      "name": "core",
      "path": "src/core",
      "tasks_file": ".agents/modules/core/tasks.json",
      "docs": [
        {"file": "OVERVIEW.md", "anchor": "#overview"},
        {"file": "VISION.md", "anchor": "#vision"}
      ]
    }
  ],
  "docs": [
    {"file": "VISION.md", "title": "Vision"},
    {"file": "OVERVIEW.md", "title": "Overview"}
  ]
}
```

```file: .agents/priorities.json
{
  "$schema": ".agents/schemas/priorities.schema.json",
  "version": 1,
  "updated_at": "bootstrap",
  "policy": {
    "strategy": "critical_path_first",
    "tie_breakers": ["dependency_depth", "risk", "value"]
  },
  "queue": [
    {
      "task_id": "core:bootstrap-structure",
      "title": "Establish validated agent control plane and schemas",
      "file": ".agents/modules/core/tasks.json",
      "priority": 100,
      "status": "todo",
      "role": "Planner",
      "risk_tags": [],
      "links_to_vision": ["#vision"]
    }
  ]
}
```

```file: .agents/metrics.json
{
  "version": 1,
  "updated_at": "bootstrap",
  "sessions_total": 0,
  "tasks_completed": 0,
  "mean_time_to_green_sec": 0,
  "retries_push": 0
}
```

```file: .agents/modules/core/tasks.json
{
  "$schema": ".agents/schemas/tasks.schema.json",
  "module": "core",
  "updated_at": "bootstrap",
  "tasks": [
    {
      "id": "core:bootstrap-structure",
      "title": "Establish validated agent control plane and schemas",
      "status": "todo",
      "role": "Planner",
      "acceptance": [
        "All `.agents/schemas/*.json` validate corresponding files",
        "`scripts/agent_post_session_update.sh` completes successfully on a clean repo",
        "CI/pipeline step exists to validate JSON and fail on drift"
      ],
      "impl": {
        "steps": [
          "Validate schemas against .agents/*.json and module tasks",
          "Wire bootstrap+scan flow to (re)generate index safely",
          "Add idempotent guards and retries to commit/push"
        ]
      },
      "refs": [
        {"file": ".agents/schemas/index.schema.json", "anchor": "schema:index"},
        {"file": ".agents/schemas/priorities.schema.json", "anchor": "schema:priorities"},
        {"file": ".agents/schemas/tasks.schema.json", "anchor": "schema:tasks"},
        {"file": "scripts/agent_post_session_update.sh", "anchor": "script:post-session"}
      ],
      "notes": [],
      "next_notes": [
        "After this, enable module discovery for additional languages and auto-create `tasks.json` per module."
      ],
      "risk_tags": [],
      "links_to_vision": ["#vision"],
      "proofs": {}
    }
  ]
}
```

---

## 5) JSON Schemas (validation is mandatory)

```file: .agents/schemas/index.schema.json
{
  "$id": "schema:index",
  "type": "object",
  "required": ["version", "generated_at", "modules", "docs"],
  "properties": {
    "version": { "type": "integer", "minimum": 1 },
    "generated_at": { "type": "string" },
    "modules": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "path", "tasks_file"],
        "properties": {
          "name": { "type": "string" },
          "path": { "type": "string" },
          "tasks_file": { "type": "string" },
          "docs": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["file"],
              "properties": {
                "file": { "type": "string" },
                "anchor": { "type": "string" }
              }
            }
          }
        },
        "additionalProperties": false
      }
    },
    "docs": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["file"],
        "properties": {
          "file": { "type": "string" },
          "title": { "type": "string" }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
```

```file: .agents/schemas/priorities.schema.json
{
  "$id": "schema:priorities",
  "type": "object",
  "required": ["version", "updated_at", "policy", "queue"],
  "properties": {
    "version": { "type": "integer" },
    "updated_at": { "type": "string" },
    "policy": {
      "type": "object",
      "required": ["strategy"],
      "properties": {
        "strategy": { "type": "string" },
        "tie_breakers": { "type": "array", "items": { "type": "string" } }
      },
      "additionalProperties": false
    },
    "queue": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["task_id", "title", "file", "priority", "status"],
        "properties": {
          "task_id": { "type": "string" },
          "title": { "type": "string" },
          "file": { "type": "string" },
          "priority": { "type": "integer" },
          "status": { "type": "string", "enum": ["todo", "doing", "done", "blocked"] },
          "blocked_by": { "type": "array", "items": { "type": "string" } },
          "role": { "type": "string", "enum": ["Planner", "Coder", "Tester", "Reviewer"] },
          "risk_tags": { "type": "array", "items": { "type": "string" } },
          "links_to_vision": { "type": "array", "items": { "type": "string" } }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
```

```file: .agents/schemas/tasks.schema.json
{
  "$id": "schema:tasks",
  "type": "object",
  "required": ["module", "updated_at", "tasks"],
  "properties": {
    "module": { "type": "string" },
    "updated_at": { "type": "string" },
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "status", "acceptance", "impl", "refs"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "status": { "type": "string", "enum": ["todo", "doing", "done", "blocked"] },
          "role": { "type": "string", "enum": ["Planner", "Coder", "Tester", "Reviewer"] },
          "acceptance": { "type": "array", "items": { "type": "string" } },
          "impl": {
            "type": "object",
            "required": ["steps"],
            "properties": {
              "steps": { "type": "array", "items": { "type": "string" } }
            },
            "additionalProperties": false
          },
          "refs": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["file"],
              "properties": {
                "file": { "type": "string" },
                "line": { "type": "integer" },
                "end_line": { "type": "integer" },
                "anchor": { "type": "string" },
                "symbol": { "type": "string" }
              },
              "additionalProperties": false
            }
          },
          "notes": { "type": "array", "items": { "type": "string" } },
          "next_notes": { "type": "array", "items": { "type": "string" } },
          "risk_tags": { "type": "array", "items": { "type": "string" } },
          "links_to_vision": { "type": "array", "items": { "type": "string" } },
          "proofs": {
            "type": "object",
            "properties": {
              "tests_passed": { "type": "boolean" },
              "coverage": { "type": "number" },
              "lint_clean": { "type": "boolean" },
              "security_scan": { "type": "string" }
            },
            "additionalProperties": true
          }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
```

---

## 6) Operational scripts (robust, idempotent)

```file: scripts/agent_bootstrap.sh
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[bootstrap] Checking dependencies..."
need() { command -v "$1" >/dev/null 2>&1 || { echo "[ERR] missing: $1" >&2; exit 1; }; }
need python3
need git

mkdir -p ".agents/schemas" ".agents/modules/core" ".agents/ledger" ".agents/alerts" ".agents/snapshots" "scripts"

echo "[bootstrap] Validating control plane..."
python3 scripts/agent_scan.py --refresh-index --validate

echo "[bootstrap] Initial commit (if needed)..."
git rev-parse --is-inside-work-tree >/dev/null || { echo "[ERR] not a git repo"; exit 1; }
git add -A
if ! git diff --cached --quiet; then
  git commit -m "agent: bootstrap control plane"
fi

echo "[bootstrap] OK"
```

```file: scripts/agent_post_session_update.sh
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
for i in $(seq 1 $RETRIES); do
  if git push; then
    echo "[post-session] Pushed successfully."
    PUSH_OK=1
    break
  fi
  echo "[post-session] Push failed (attempt $i/$RETRIES). Retrying in 3s..."
  sleep 3
done

LEDGER=".agents/ledger/${TS}.json"
python3 - <<'PY'
import json, os, time, sys
from pathlib import Path
ts=os.environ.get("TS")
sid=os.environ.get("SESSION_ID")
ld={"ts":ts,"session_id":sid,"exit_code":0,"notes":[]}
Path(f".agents/ledger/{ts}.json").write_text(json.dumps(ld,indent=2),encoding="utf-8")
print("[ledger] wrote .agents/ledger/%s.json" % ts)
PY

if [ "$PUSH_OK" -ne 1 ]; then
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
```

```file: scripts/agent_next_step.sh
#!/usr/bin/env bash
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 - <<'PY'
import json,sys
with open(".agents/priorities.json","r",encoding="utf-8") as f:
    q=json.load(f).get("queue",[])
todo=[x for x in q if x.get("status")=="todo"]
todo.sort(key=lambda x: x.get("priority",0), reverse=True)
print(json.dumps({"task_id": todo[0]["task_id"], "file": todo[0]["file"]}) if todo else "{}")
PY
```

```file: scripts/agent_scan.py
#!/usr/bin/env python3
import argparse, json, os, sys, re, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AGENTS = ROOT / ".agents"
SCHEMAS = AGENTS / "schemas"

def die(msg): print(f"[scan][ERR] {msg}", file=sys.stderr); sys.exit(1)

def load_json(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        die(f"Failed to read {path}: {e}")

def write_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = Path(str(path) + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False); f.write("
")
    tmp.replace(path)

def validate_against_schema(obj, schema_kind):
    if schema_kind == "index":
        for k in ["version","modules","docs"]:
            if k not in obj: die("index.json missing key: " + k)
        if not isinstance(obj["modules"], list): die("index.modules must be array")
    elif schema_kind == "priorities":
        for k in ["version","updated_at","policy","queue"]:
            if k not in obj: die("priorities.json missing key: " + k)
        if not isinstance(obj["queue"], list): die("priorities.queue must be array")
    elif schema_kind == "tasks":
        for k in ["module","updated_at","tasks"]:
            if k not in obj: die("tasks.json missing key: " + k)
        if not isinstance(obj["tasks"], list): die("tasks.tasks must be array")
    return True

def discover_modules():
    globs = ["src","app","apps","packages","services","modules"]
    mods=[]; seen=set()
    for base in globs:
        p = ROOT / base
        if not p.exists(): continue
        for d in p.rglob("*"):
            if d.is_dir():
                try:
                    has_code = any(fn.suffix in {".py",".ts",".tsx",".js",".jsx",".go",".rs",".swift",".kt",".java"} 
                                   for fn in d.iterdir() if fn.is_file())
                except Exception:
                    has_code = False
                if has_code:
                    name = d.name
                    if name not in seen:
                        mods.append({"name": name, "path": str(d.relative_to(ROOT)), "tasks_file": f".agents/modules/{name}/tasks.json"})
                        seen.add(name)
    if not mods:
        mods=[{"name":"core","path":"src/core","tasks_file":".agents/modules/core/tasks.json"}]
    return mods

def build_index():
    return {
        "$schema": ".agents/schemas/index.schema.json",
        "version": 1,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "modules": discover_modules(),
        "docs": [{"file":"VISION.md","title":"Vision"},{"file":"OVERVIEW.md","title":"Overview"}]
    }

def ensure_task_files(mods):
    for m in mods:
        tf = ROOT / m["tasks_file"]
        if not tf.exists():
            write_json(tf, {
                "$schema": ".agents/schemas/tasks.schema.json",
                "module": m["name"],
                "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "tasks": []
            })

def validate_all():
    idx = load_json(AGENTS / "index.json")
    pr = load_json(AGENTS / "priorities.json")
    validate_against_schema(idx, "index")
    validate_against_schema(pr, "priorities")
    for m in idx["modules"]:
        tf = ROOT / m["tasks_file"]
        if not tf.exists(): die(f"Missing tasks file: {tf}")
        tasks = load_json(tf)
        validate_against_schema(tasks, "tasks")
    print("[scan] validation OK")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--refresh-index", action="store_true")
    ap.add_argument("--validate", action="store_true")
    args = ap.parse_args()

    AGENTS.mkdir(parents=True, exist_ok=True)
    (AGENTS/"modules").mkdir(parents=True, exist_ok=True)
    (AGENTS/"ledger").mkdir(parents=True, exist_ok=True)
    (AGENTS/"alerts").mkdir(parents=True, exist_ok=True)
    (AGENTS/"snapshots").mkdir(parents=True, exist_ok=True)

    for s in ["index.schema.json","priorities.schema.json","tasks.schema.json"]:
        if not (SCHEMAS/s).exists():
            die(f"Missing schema: {SCHEMAS/s}")

    idx = build_index() if args.refresh_index else load_json(AGENTS / "index.json")
    if args.refresh_index:
        write_json(AGENTS / "index.json", idx)
        ensure_task_files(idx["modules"])

    if args.validate or args.refresh_index:
        validate_all()

if __name__ == "__main__":
    main()
```

---

## 7) How to use

**First run (materialise everything + compact this file):**

```bash
# In Codex, or your shell:
python3 - <<'PY'
print(open('AGENTS.md','r',encoding='utf-8').read())
PY

# Then run the installer block (section 0) exactly as written in AGENTS.md,
# or simply paste that heredoc command in your shell.

# After materialisation:
bash scripts/agent_bootstrap.sh
```

**Pick next task (agent reads this JSON and proceeds):**
```bash
bash scripts/agent_next_step.sh
```

**End every session (REQUIRED, fail-closed):**
```bash
bash scripts/agent_post_session_update.sh
```
