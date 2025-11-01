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
