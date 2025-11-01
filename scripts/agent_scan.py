#!/usr/bin/env python3
"""Control plane validation and index maintenance utilities."""

from __future__ import annotations

import argparse
import json
import sys
import time
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

ROOT = Path(__file__).resolve().parents[1]
AGENTS = ROOT / ".agents"
SCHEMAS = AGENTS / "schemas"

SCHEMA_FILES = {
    "index": "index.schema.json",
    "priorities": "priorities.schema.json",
    "tasks": "tasks.schema.json",
}
SEARCH_ROOTS: Iterable[str] = ("src", "app", "apps", "packages", "services", "modules")
CODE_SUFFIXES = {".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".swift", ".kt", ".java"}


class SchemaValidationError(Exception):
    """Raised when JSON content does not satisfy its schema."""


def die(msg: str) -> None:
    print(f"[scan][ERR] {msg}", file=sys.stderr)
    sys.exit(1)


def load_json(path: Path) -> Dict[str, Any]:
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        die(f"Required file missing: {path}")
    except json.JSONDecodeError as exc:
        die(f"Invalid JSON in {path}: {exc}")
    except Exception as exc:  # pragma: no cover - unexpected filesystem issues
        die(f"Failed to read {path}: {exc}")


def write_json(path: Path, obj: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(obj, indent=2, ensure_ascii=False) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == payload:
        return
    tmp = Path(str(path) + ".tmp")
    tmp.write_text(payload, encoding="utf-8")
    tmp.replace(path)


@lru_cache(maxsize=None)
def load_schema(schema_kind: str) -> Dict[str, Any]:
    if schema_kind not in SCHEMA_FILES:
        die(f"Unknown schema kind: {schema_kind}")
    schema_path = SCHEMAS / SCHEMA_FILES[schema_kind]
    try:
        with open(schema_path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except FileNotFoundError:
        die(f"Schema missing: {schema_path}")
    except json.JSONDecodeError as exc:
        die(f"Schema {schema_path} is not valid JSON: {exc}")
    except Exception as exc:  # pragma: no cover - unexpected filesystem issues
        die(f"Failed to read schema {schema_path}: {exc}")


def _check_type(value: Any, expected: str, path: str) -> None:
    if expected == "object" and not isinstance(value, dict):
        raise SchemaValidationError(f"{path} expected object, found {type(value).__name__}")
    if expected == "array" and not isinstance(value, list):
        raise SchemaValidationError(f"{path} expected array, found {type(value).__name__}")
    if expected == "string" and not isinstance(value, str):
        raise SchemaValidationError(f"{path} expected string, found {type(value).__name__}")
    if expected == "integer":
        if not isinstance(value, int) or isinstance(value, bool):
            raise SchemaValidationError(f"{path} expected integer, found {type(value).__name__}")
    if expected == "number" and not isinstance(value, (int, float)):
        raise SchemaValidationError(f"{path} expected number, found {type(value).__name__}")
    if expected == "boolean" and not isinstance(value, bool):
        raise SchemaValidationError(f"{path} expected boolean, found {type(value).__name__}")
    if expected == "null" and value is not None:
        raise SchemaValidationError(f"{path} expected null, found {type(value).__name__}")


def _validate(instance: Any, schema: Dict[str, Any], path: str = "$") -> None:
    schema_type = schema.get("type")
    effective_type: Optional[str] = None
    if isinstance(schema_type, list):
        for candidate in schema_type:
            try:
                _check_type(instance, candidate, path)
            except SchemaValidationError:
                continue
            effective_type = candidate
            break
        if effective_type is None:
            raise SchemaValidationError(f"{path} does not match any allowed type {schema_type}")
    elif isinstance(schema_type, str):
        _check_type(instance, schema_type, path)
        effective_type = schema_type

    if effective_type == "object":
        required = schema.get("required", [])
        for key in required:
            if key not in instance:
                raise SchemaValidationError(f"{path} missing required property '{key}'")
        properties = schema.get("properties", {})
        additional = schema.get("additionalProperties", True)
        for key, value in instance.items():
            if key in properties:
                _validate(value, properties[key], f"{path}.{key}")
            elif isinstance(additional, dict):
                _validate(value, additional, f"{path}.{key}")
            elif additional is False:
                raise SchemaValidationError(f"{path} has unexpected property '{key}'")
    elif effective_type == "array":
        items = schema.get("items")
        if isinstance(items, dict):
            for index, value in enumerate(instance):
                _validate(value, items, f"{path}[{index}]")
        elif isinstance(items, list):
            if len(instance) != len(items):
                raise SchemaValidationError(f"{path} expected {len(items)} entries, found {len(instance)}")
            for index, subschema in enumerate(items):
                _validate(instance[index], subschema, f"{path}[{index}]")

    if "minimum" in schema:
        minimum = schema["minimum"]
        if isinstance(instance, (int, float)) and instance < minimum:
            raise SchemaValidationError(f"{path} value {instance} below minimum {minimum}")
    if "enum" in schema:
        if instance not in schema["enum"]:
            raise SchemaValidationError(f"{path} value {instance!r} not in enum {schema['enum']}")


def validate_against_schema(data: Dict[str, Any], schema_kind: str, source: Path) -> None:
    schema = load_schema(schema_kind)
    try:
        _validate(data, schema)
    except SchemaValidationError as exc:
        die(f"{source} failed validation: {exc}")


def discover_modules() -> List[Dict[str, str]]:
    modules: List[Dict[str, str]] = []
    seen: set[str] = set()
    for root in SEARCH_ROOTS:
        base_path = ROOT / root
        if not base_path.exists():
            continue
        for candidate in sorted(base_path.rglob("*")):
            if not candidate.is_dir():
                continue
            try:
                has_code = any(child.is_file() and child.suffix in CODE_SUFFIXES for child in candidate.iterdir())
            except Exception:
                has_code = False
            if not has_code:
                continue
            rel_path = candidate.relative_to(ROOT)
            rel_key = str(rel_path).replace("\\", "/")
            if rel_key in seen:
                continue
            modules.append(
                {
                    "name": candidate.name,
                    "path": rel_key,
                    "tasks_file": f".agents/modules/{candidate.name}/tasks.json",
                }
            )
            seen.add(rel_key)
    if not modules:
        modules.append(
            {
                "name": "core",
                "path": "src/core",
                "tasks_file": ".agents/modules/core/tasks.json",
            }
        )
    modules.sort(key=lambda item: (item["path"], item["name"]))
    return modules


def build_index(existing: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    discovered = {module["name"]: module for module in discover_modules()}
    modules_dir = AGENTS / "modules"
    for tasks_file in modules_dir.glob("*/tasks.json"):
        module_name = tasks_file.parent.name
        if module_name in discovered:
            continue
        fallback_path = Path("src") / module_name
        if fallback_path.exists():
            rel_path = fallback_path.as_posix()
        else:
            rel_path = tasks_file.parent.relative_to(ROOT).as_posix()
        discovered[module_name] = {
            "name": module_name,
            "path": rel_path,
            "tasks_file": tasks_file.relative_to(ROOT).as_posix(),
        }
    if existing:
        for module in existing.get("modules", []):
            name = module.get("name")
            if not name:
                continue
            if name not in discovered:
                discovered[name] = module
    modules = sorted(discovered.values(), key=lambda item: (item.get("path", item["name"]), item["name"]))
    docs = [
        {"file": "VISION.md", "title": "Vision"},
        {"file": "OVERVIEW.md", "title": "Overview"},
    ]
    if existing and existing.get("modules") == modules and existing.get("docs") == docs:
        generated_at = existing.get("generated_at", "")
    else:
        generated_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    return {
        "$schema": ".agents/schemas/index.schema.json",
        "version": 1,
        "generated_at": generated_at,
        "modules": modules,
        "docs": docs,
    }


def ensure_task_files(modules: Iterable[Dict[str, str]]) -> None:
    for module in modules:
        tf = ROOT / module["tasks_file"]
        if tf.exists():
            continue
        write_json(
            tf,
            {
                "$schema": ".agents/schemas/tasks.schema.json",
                "module": module["name"],
                "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "tasks": [],
            },
        )


def validate_all() -> None:
    index_path = AGENTS / "index.json"
    priorities_path = AGENTS / "priorities.json"

    index = load_json(index_path)
    validate_against_schema(index, "index", index_path)

    task_catalog: dict[str, Path] = {}
    for module in index.get("modules", []):
        task_file = ROOT / module["tasks_file"]
        if not task_file.exists():
            die(f"Missing tasks file referenced by index: {task_file}")
        tasks_payload = load_json(task_file)
        validate_against_schema(tasks_payload, "tasks", task_file)
        if tasks_payload.get("module") != module["name"]:
            die(
                "Tasks file %s declares module %s but index expects %s"
                % (task_file, tasks_payload.get("module"), module["name"])
            )
        for task in tasks_payload.get("tasks", []):
            task_id = task.get("id")
            if not task_id:
                die(f"Task entry without id in {task_file}")
            task_catalog[task_id] = task_file

    for doc in index.get("docs", []):
        doc_path = ROOT / doc["file"]
        if not doc_path.exists():
            die(f"Indexed doc missing on disk: {doc_path}")

    priorities = load_json(priorities_path)
    validate_against_schema(priorities, "priorities", priorities_path)

    for entry in priorities.get("queue", []):
        task_id = entry.get("task_id")
        if task_id and task_id not in task_catalog:
            die(f"Priority queue references unknown task_id '{task_id}'")
        file_ref = entry.get("file")
        if file_ref and task_id:
            expected = task_catalog[task_id].relative_to(ROOT)
            if file_ref != str(expected).replace("\\", "/"):
                die(
                    "Priority queue entry for %s points to %s but expected %s"
                    % (task_id, file_ref, expected)
                )

    print("[scan] validation OK")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh-index", action="store_true", help="Regenerate .agents/index.json")
    parser.add_argument("--validate", action="store_true", help="Validate control plane JSON files")
    args = parser.parse_args()

    AGENTS.mkdir(parents=True, exist_ok=True)
    (AGENTS / "modules").mkdir(parents=True, exist_ok=True)
    (AGENTS / "ledger").mkdir(parents=True, exist_ok=True)
    (AGENTS / "alerts").mkdir(parents=True, exist_ok=True)
    (AGENTS / "snapshots").mkdir(parents=True, exist_ok=True)

    for schema_name in SCHEMA_FILES.values():
        if not (SCHEMAS / schema_name).exists():
            die(f"Missing schema: {SCHEMAS / schema_name}")

    if args.refresh_index:
        existing_index = load_json(AGENTS / "index.json") if (AGENTS / "index.json").exists() else None
        new_index = build_index(existing_index)
        write_json(AGENTS / "index.json", new_index)
        ensure_task_files(new_index["modules"])

    if args.validate or args.refresh_index:
        validate_all()


if __name__ == "__main__":
    main()
