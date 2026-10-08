#!/usr/bin/env bash
# Hook SessionStart (keputusan 140): cetak bagian "Sedang dikerjakan" dari
# plan/MEMORI.md. Stdout hook SessionStart masuk ke konteks sesi.
set -u
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}" || exit 0
[ -f plan/MEMORI.md ] || exit 0

echo "Dari plan/MEMORI.md (branch: $(git branch --show-current 2>/dev/null)):"
awk '/^## Sedang dikerjakan/{on=1; print; next} on && /^## /{exit} on' plan/MEMORI.md
exit 0
