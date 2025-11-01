#!/usr/bin/env bash
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 - <<'PY'
import json
with open(".agents/priorities.json","r",encoding="utf-8") as f:
    q=json.load(f).get("queue",[])
todo=[x for x in q if x.get("status")=="todo" and "task_id" in x and "file" in x]
todo.sort(key=lambda x: x.get("priority",0), reverse=True)
print(json.dumps({"task_id": todo[0]["task_id"], "file": todo[0]["file"]}) if todo else "{}")
PY
