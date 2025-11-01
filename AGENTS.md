# AGENTS.md

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
