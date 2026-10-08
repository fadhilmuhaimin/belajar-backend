#!/usr/bin/env bash
# Hook PreCompact (keputusan 140): simpan MEMORI, STATUS, dan KEPUTUSAN ke git
# sebelum konteks diringkas, supaya sesi berikutnya mulai dari file, bukan ingatan.
# Tidak pernah memblokir compaction: selalu keluar 0.
set -u
cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}" || exit 0

FILES=(plan/MEMORI.md plan/STATUS.md plan/KEPUTUSAN.md)
branch=$(git branch --show-current 2>/dev/null)

if [ -z "$(git status --porcelain -- "${FILES[@]}" 2>/dev/null)" ]; then
  echo "simpan-memori: MEMORI/STATUS/KEPUTUSAN tidak berubah, tidak ada commit." >&2
elif [ "$branch" = "main" ] || [ -z "$branch" ]; then
  echo "simpan-memori: di '${branch:-detached}', commit dilewati. Pindah ke branch tahap-1/<halaman> lalu commit plan/ sendiri." >&2
else
  git add -- "${FILES[@]}" &&
    git commit -q -m "Simpan memori sebelum compaction" -- "${FILES[@]}" &&
    echo "simpan-memori: plan/ di-commit ke $branch." >&2
fi

echo "Pengingat: setelah compaction, baca plan/MEMORI.md bagian \"Sedang dikerjakan\" sebelum lanjut." >&2
exit 0
