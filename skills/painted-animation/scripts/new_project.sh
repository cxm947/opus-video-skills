#!/usr/bin/env bash
# Backward-compatible entry; the implementation is platform independent.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$SCRIPT_DIR/new_project.mjs" "$@"
