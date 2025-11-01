# Overview

Authoritative machine index: `.agents/index.json`  
Start here for tasks: `.agents/priorities.json`  
Module task lists: `.agents/modules/**/tasks.json`

Auto-select the next task:
- Run `bash scripts/agent_next_step.sh` to emit a JSON payload describing the highest-priority TODO from `.agents/priorities.json`.
- The script ignores malformed queue entries to guarantee safe automation; if no eligible task exists it returns `{}`.
