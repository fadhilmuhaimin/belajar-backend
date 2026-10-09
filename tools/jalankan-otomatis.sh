#!/usr/bin/env bash
# Loop otomatis semalam (keputusan 216). Menggantikan tools/jalankan-tahap.sh (yang lama tetap ada).
# Satu-satunya pekerja di repo: setiap iterasi satu sesi `claude -p` baru yang membaca
# plan/PROTOKOL-OTOMATIS.md, mengerjakan SATU tugas dari plan/ANTREAN.md sampai PR merge, lalu keluar.
#
# Pemakaian:
#   caffeinate -dims bash tools/jalankan-otomatis.sh       jalankan sampai salah satu syarat berhenti
#   bash tools/jalankan-otomatis.sh --periksa               cetak keadaan dan perintah, tanpa memanggil claude
#   BATAS_ITERASI=1 bash tools/jalankan-otomatis.sh         uji kering: satu iterasi lalu laporan pagi
#
# Variabel: BERHENTI_JAM (07:00), BATAS_ITERASI (0 = tanpa batas), MODEL (claude-opus-5-5),
#   MODEL_CADANGAN (claude-opus-4-8), MAKS_TURN (300), TUNGGU_DETIK (900), BUDGET_USD (kosong),
#   EFFORT (kosong = bawaan akun).
#
# Flag dicek ke `claude --help` 2.1.292 dan https://code.claude.com/docs/en/cli-reference (2026-10-09):
#   --permission-mode dontAsk   menolak otomatis semua yang biasanya meminta izin; yang jalan hanya
#                               aksi tanpa izin (baca file, perintah read-only) dan allowlist
#                               permissions.allow di .claude/settings.json. Dipilih karena pemilik minta
#                               allowlist, bukan melewati semua izin: bypassPermissions melewati semuanya,
#                               dan auto menyerahkan keputusan ke classifier yang pernah menolak
#                               `gh pr merge` (MEMORI "Pelajaran").
#   --permission-prompts none   kalau ada yang tetap meminta izin, langsung ditolak; sesi tidak menggantung.
#   --settings <file>           tools/otomatis.settings.json menambah aturan deny khusus loop (CLAUDE.md,
#                               CERITA, PROPOSAL, protokol, .claude/, gh secret, gh api). Daftar
#                               permissions digabung lintas sumber, bukan diganti (docs settings,
#                               "Lists merge instead of overriding"), dan deny selalu menang atas allow.
#   --max-turns <n>             batas turn per iterasi; kalau tercapai, claude keluar dengan error
#                               (subtype error_max_turns) dan skrip memperlakukannya sebagai iterasi gagal.
#                               Tidak tercetak di `--help` lokal, ada di cli-reference.
#   --model / --fallback-model  model utama dipin ke ID penuh supaya semalaman tidak berganti diam-diam.
#                               --fallback-model hanya aktif saat model utama overloaded atau tidak tersedia;
#                               fallback karena safety classifier (Opus 5.5 -> Opus 4.8 untuk konten keamanan)
#                               sudah otomatis di Claude Code (docs model-config). Percobaan kedua untuk
#                               tugas yang sama memakai MODEL_CADANGAN sebagai model utama. Keduanya dicek
#                               bisa dipanggil pada 2026-10-09 (`claude -p --model <id>` menjawab).
#   --output-format stream-json --verbose   satu event JSON per baris selama sesi, jadi log terisi saat
#                               iterasi berjalan; event terakhir `type: result` dipakai untuk menilai hasil.
#
# Saat iterasi gagal (kode keluar bukan 0, result is_error, batas pemakaian, atau sesi dihentikan pengaman
# model): sisa kerja disimpan (commit ke branch tugas, atau stash bila di main), tunggu TUNGGU_DETIK, ulangi
# dengan MODEL_CADANGAN. Gagal dua kali karena error -> tugas diparkir lewat PR kecil, lanjut ke tugas
# berikutnya. Gagal karena batas pemakaian akun tidak memarkir tugas (tugas lain akan kena batas yang sama);
# skrip menunggu sampai batas pulih atau jam berhenti. Isi tugas tidak pernah diubah untuk menghindari pengaman.
#
# Berhenti bila: antrean habis; BATAS_ITERASI tercapai; 3 iterasi berturut tanpa commit baru di main;
# 5 tugas diparkir berturut; main merah sesudah 2 iterasi perbaikan; melewati BERHENTI_JAM; Ctrl-C.
# Apa pun alasannya, satu sesi terakhir menulis plan/LAPORAN-PAGI.md, lalu notifikasi macOS.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROMPT='Baca plan/PROTOKOL-OTOMATIS.md dan kerjakan satu iterasi.'
BERHENTI_JAM="${BERHENTI_JAM:-07:00}"
BATAS_ITERASI="${BATAS_ITERASI:-0}"
MODEL="${MODEL:-claude-opus-5-5}"
MODEL_CADANGAN="${MODEL_CADANGAN:-claude-opus-4-8}"
MAKS_TURN="${MAKS_TURN:-300}"
TUNGGU_DETIK="${TUNGGU_DETIK:-900}"
BUDGET_USD="${BUDGET_USD:-}"
EFFORT="${EFFORT:-}"
MAKS_TANPA_COMMIT=3
MAKS_PARKIR_BERTURUT=5
MAKS_MAIN_MERAH=2
SETELAN="$ROOT/tools/otomatis.settings.json"
# Pesan batas pemakaian dan beban dicari di teks result dan 20 baris terakhir stderr (lihat nilai_sesi).
POLA_LIMIT='usage limit|rate.?limit|limit reached|hit your limit|resets at|overloaded|API Error: ?(429|529)'

MULAI_EPOCH=$(date +%s)
MULAI="$(date '+%Y-%m-%d %H:%M')"
LOGDIR="$ROOT/log/otomatis-$(date +%Y-%m-%d)"
KEJADIAN="$LOGDIR/kejadian.txt"
KUNCI="$ROOT/tmp/otomatis.lock"

catat() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$KEJADIAN"; }

# Epoch BERHENTI_JAM berikutnya: hari ini bila belum lewat, kalau sudah lewat besok.
hitung_batas() {
  local t
  t=$(date -j -f "%Y-%m-%d %H:%M" "$(date +%Y-%m-%d) $BERHENTI_JAM" +%s) || return 1
  [ "$t" -le "$MULAI_EPOCH" ] && t=$((t + 86400))
  echo "$t"
}

pengaman() {
  local branch kotor
  branch=$(git branch --show-current)
  kotor=$(git status --porcelain)
  if [ -n "$kotor" ]; then
    echo "BERHENTI: working tree tidak bersih. Commit atau stash dulu:" >&2
    echo "$kotor" | head -20 >&2
    return 1
  fi
  if [ "$branch" != "main" ]; then
    echo "BERHENTI: branch sekarang '${branch:-detached}', bukan main. Jalankan: git checkout main && git pull" >&2
    return 1
  fi
}

# Kembalikan checkout ke main bersih. Sisa kerja iterasi yang terhenti disimpan, tidak dibuang.
pulihkan() {
  local branch
  branch=$(git branch --show-current)
  git fetch -q origin 2>/dev/null || true
  if [ -n "$(git status --porcelain)" ]; then
    if [ -n "$branch" ] && [ "$branch" != "main" ]; then
      if git add -A && git commit -q -m "Simpan sisa iterasi yang terhenti" && git push -q -u origin "$branch"; then
        catat "sisa kerja disimpan di branch $branch"
      else
        git stash push -q -u -m "otomatis: sisa $branch $(date +%H%M)" && catat "sisa kerja $branch disimpan ke stash"
      fi
    else
      git stash push -q -u -m "otomatis: sisa di main $(date +%H%M)" && catat "sisa kerja di main disimpan ke stash"
    fi
  elif [ -n "$branch" ] && [ "$branch" != "main" ] && [ -z "$(git branch -r --contains HEAD 2>/dev/null)" ]; then
    # Commit yang belum ada di remote mana pun (bukan branch yang sudah di-merge lalu dihapus).
    git push -q -u origin "$branch" 2>/dev/null && catat "commit lokal $branch didorong ke remote"
  fi
  git checkout -q main 2>/dev/null || { catat "gagal checkout main"; return 1; }
  git pull -q --ff-only origin main || { catat "gagal pull main"; return 1; }
}

# Jalankan satu sesi claude. $1 prompt, $2 model, $3 berkas log. Mengembalikan kode keluar claude.
sesi() {
  local cadangan="$MODEL_CADANGAN"
  [ "$2" = "$MODEL_CADANGAN" ] && cadangan="$MODEL"
  local opsi=(--model "$2" --fallback-model "$cadangan"
    --permission-mode dontAsk --permission-prompts none --settings "$SETELAN"
    --max-turns "$MAKS_TURN" --output-format stream-json --verbose)
  [ -n "$BUDGET_USD" ] && opsi+=(--max-budget-usd "$BUDGET_USD")
  [ -n "$EFFORT" ] && opsi+=(--effort "$EFFORT")
  claude -p "$1" "${opsi[@]}" > "$3" 2>&1 < /dev/null
}

# Nilai hasil sesi: ok, limit, atau error. $1 berkas log, $2 kode keluar.
# Setiap sesi memancarkan event rate_limit_event (status "allowed" bila aman, dicek 2026-10-09), jadi teks
# "rate_limit" di log bukan tanda batas; yang dibaca field status-nya, plus pesan di result dan stderr.
nilai_sesi() {
  local hasil subtype galat teks kuota
  hasil=$(grep '"type":"result"' "$1" | tail -1)
  subtype=$(jq -r '.subtype // ""' <<<"$hasil" 2>/dev/null)
  galat=$(jq -r '.is_error // false' <<<"$hasil" 2>/dev/null)
  teks=$(jq -r '.result // ""' <<<"$hasil" 2>/dev/null)
  if [ "$2" = 0 ] && [ "$subtype" = success ] && [ "$galat" = false ]; then
    echo ok; return
  fi
  kuota=$(grep '"type":"rate_limit_event"' "$1" | tail -1 | jq -r '.rate_limit_info.status // ""' 2>/dev/null)
  case "$kuota" in
    "" | allowed*) ;;
    *) echo limit; return ;;
  esac
  if { printf '%s\n' "$teks"; grep -v '^{' "$1" | tail -20; } | grep -qiE "$POLA_LIMIT"; then
    echo limit
  else
    echo error
  fi
}

# Baris "Iterasi selesai: <id> <status>" dari result sesi. $1 berkas log.
baris_selesai() {
  grep '"type":"result"' "$1" | tail -1 | jq -r '.result // ""' 2>/dev/null |
    grep -oE 'Iterasi selesai: [^ ]+ [a-z-]+' | tail -1
}

# Status CI terakhir di main: hijau, merah, atau tidak-diketahui (gh gagal atau belum ada run).
# Menunggu run yang masih berjalan. Hanya "merah" yang dihitung sebagai main merah.
status_main() {
  local run status kesimpulan
  run=$(gh run list --branch main --workflow cek --limit 1 --json databaseId,status,conclusion 2>/dev/null)
  if [ -z "$run" ] || [ "$(jq 'length' <<<"$run" 2>/dev/null)" != 1 ]; then echo tidak-diketahui; return; fi
  status=$(jq -r '.[0].status // ""' <<<"$run")
  if [ -n "$status" ] && [ "$status" != completed ]; then
    gh run watch "$(jq -r '.[0].databaseId' <<<"$run")" --interval 30 >/dev/null 2>&1
    run=$(gh run list --branch main --workflow cek --limit 1 --json conclusion)
  fi
  kesimpulan=$(jq -r '.[0].conclusion // ""' <<<"$run")
  [ "$kesimpulan" = success ] && echo hijau || echo merah
}

# PR kecil dari skrip untuk memarkir tugas yang sesinya gagal dua kali. $1 id, $2 alasan.
parkir_dari_skrip() {
  local id="$1" alasan="$2" cabang pr
  cabang="antrean/parkir-$(printf '%s' "$id" | tr '.' '-')-$(date +%H%M)"
  pulihkan || return 1
  git checkout -q -b "$cabang" || return 1
  python3 tools/antrean.py parkir "$id" "$alasan" && python3 tools/antrean.py --check >/dev/null || return 1
  git commit -q -am "Parkir tugas $id: sesi otomatis gagal dua kali (keputusan 216)" || return 1
  git push -q -u origin "$cabang" || return 1
  pr=$(gh pr create --base main --head "$cabang" --title "Parkir tugas $id" \
    --body "Dibuat tools/jalankan-otomatis.sh. $alasan" 2>/dev/null | grep -oE '[0-9]+$') || return 1
  sleep 20
  gh pr checks "$pr" --watch --interval 30 >/dev/null 2>&1 || { catat "CI PR parkir #$pr merah"; return 1; }
  gh pr merge "$pr" --merge --delete-branch >/dev/null 2>&1 || return 1
  pulihkan && catat "tugas $id diparkir lewat PR #$pr"
}

beri_tahu() {
  local pesan=${1//\"/\'}
  osascript -e "display notification \"$pesan\" with title \"Rekeningo otomatis\" sound name \"Glass\"" 2>/dev/null || true
}

laporan_pagi() {
  local alasan="$1" log="$LOGDIR/laporan-pagi.log" kode kelas prompt
  pulihkan
  prompt="Baca plan/PROTOKOL-OTOMATIS.md bagian \"Laporan pagi\" dan tulis laporan pagi. Alasan berhenti: $alasan. Loop mulai: $MULAI. Folder log: $LOGDIR. Kejadian skrip:
$(tail -40 "$KEJADIAN")"
  catat "laporan pagi: $alasan"
  sesi "$prompt" "$MODEL" "$log"; kode=$?
  kelas=$(nilai_sesi "$log" "$kode")
  if [ "$kelas" != ok ]; then
    catat "sesi laporan pagi gagal ($kelas, kode $kode); ulang sekali dengan $MODEL_CADANGAN"
    pulihkan
    sesi "$prompt" "$MODEL_CADANGAN" "$LOGDIR/laporan-pagi-2.log"; kode=$?
    kelas=$(nilai_sesi "$LOGDIR/laporan-pagi-2.log" "$kode")
  fi
  pulihkan
  if [ "$kelas" = ok ]; then
    beri_tahu "Loop berhenti: $alasan. Baca plan/LAPORAN-PAGI.md"
  else
    { echo "# Laporan pagi darurat ($(date '+%Y-%m-%d %H:%M'))"; echo; echo "Sesi laporan gagal ($kelas). Alasan berhenti: $alasan."
      echo; echo '```'; python3 tools/antrean.py ringkas; echo '```'; echo; echo '```'; tail -40 "$KEJADIAN"; echo '```'; } > "$ROOT/tmp/LAPORAN-PAGI-darurat.md"
    beri_tahu "Loop berhenti: $alasan. Sesi laporan gagal; baca tmp/LAPORAN-PAGI-darurat.md"
  fi
}

periksa() {
  pengaman && echo "pengaman: main, working tree bersih" || return 1
  echo "claude: $(claude --version) · gh: $(gh --version | head -1) · jq: $(jq --version)"
  echo "model: $MODEL, cadangan $MODEL_CADANGAN · maks turn $MAKS_TURN · tunggu $TUNGGU_DETIK detik"
  echo "berhenti: $(date -r "$(hitung_batas)" '+%Y-%m-%d %H:%M') · batas iterasi ${BATAS_ITERASI/#0/tanpa batas}"
  echo "antrean: $(python3 tools/antrean.py --check)"
  echo "tugas berikutnya: $(python3 tools/antrean.py berikut 2>&1 | head -3)"
  echo "main CI: $(status_main) · PR terbuka: $(gh pr list --state open --json number -q 'length')"
  echo "log: $LOGDIR"
}

