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
#   EFFORT (kosong = bawaan akun), TENGGANG_LAPORAN_MENIT (180).
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
# Saat iterasi gagal (kode keluar bukan 0, result is_error, atau sesi dihentikan pengaman model): sisa kerja
# disimpan (commit ke branch tugas, atau stash bila di main), tunggu TUNGGU_DETIK, ulangi dengan MODEL_CADANGAN.
# Gagal dua kali -> tugas diparkir lewat PR kecil, lanjut ke tugas berikutnya. Isi tugas tidak pernah diubah
# untuk menghindari pengaman.
# Batas pemakaian akun (keputusan 226): jam pulih dibaca dari rate_limit_event.resetsAt, skrip menunggu sampai
# jam itu + 2 menit lalu mengulang tugas yang sama dengan MODEL; tidak memarkir tugas (tugas lain akan kena
# batas yang sama). Menyerah hanya bila jam pulih lewat BERHENTI_JAM. Laporan pagi boleh menunggu sampai
# BERHENTI_JAM + TENGGANG_LAPORAN_MENIT, dan sesudah menunggu hanya jalan bila checkout masih main bersih.
# Nomor log melanjutkan nomor terbesar di log/otomatis-<tanggal>/, jadi jalan kedua di hari yang sama tidak
# menimpa log jalan pertama; log laporan pagi diberi jam mulai (laporan-pagi-HHMM.log).
#
# Berhenti bila: antrean habis; BATAS_ITERASI tercapai; 3 iterasi berturut tanpa commit baru di main;
# 5 tugas diparkir berturut; main merah sesudah 2 iterasi perbaikan; melewati BERHENTI_JAM; batas pemakaian
# baru pulih sesudah BERHENTI_JAM; Ctrl-C.
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
POLA_LIMIT='usage limit|rate.?limit|limit reached|hit your (session |weekly )?limit|resets at|overloaded|API Error: ?(429|529)'
# Laporan pagi boleh menunggu batas pemakaian pulih sampai jam berhenti ditambah tenggang ini (menit).
TENGGANG_LAPORAN_MENIT="${TENGGANG_LAPORAN_MENIT:-180}"

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

# Epoch jam pulih dari event rate_limit_event terakhir yang statusnya bukan "allowed*". $1 berkas log.
# Dicek 2026-10-10: resetsAt 1791593400 = 08:50 WITA, sama dengan pesan "resets 8:50am" di result.
jam_pulih() {
  grep '"type":"rate_limit_event"' "$1" |
    jq -r 'select((.rate_limit_info.status // "allowed") | startswith("allowed") | not) | .rate_limit_info.resetsAt // empty' 2>/dev/null |
    tail -1
}

# Tunggu sampai batas pemakaian pulih ditambah 2 menit. $1 berkas log, $2 epoch paling lambat.
# Tanpa jam pulih di log (mis. overloaded), tunggu TUNGGU_DETIK. Keluar 1 bila jam pulih lewat $2 atau Ctrl-C.
tunggu_pulih() {
  local pulih target sekarang
  sekarang=$(date +%s)
  pulih=$(jam_pulih "$1")
  if [ -n "$pulih" ]; then target=$((pulih + 120)); else pulih=$((sekarang + TUNGGU_DETIK)); target=$pulih; fi
  [ "$target" -lt "$sekarang" ] && target=$sekarang
  if [ "$target" -ge "$2" ]; then
    catat "batas pemakaian pulih $(date -r "$pulih" '+%Y-%m-%d %H:%M'), lewat batas tunggu $(date -r "$2" '+%Y-%m-%d %H:%M')"
    return 1
  fi
  catat "batas pemakaian; tunggu sampai $(date -r "$target" '+%Y-%m-%d %H:%M') (pulih $(date -r "$pulih" '+%H:%M') + 2 menit)"
  while [ "$(date +%s)" -lt "$target" ] && [ "$DIMINTA_BERHENTI" -eq 0 ]; do sleep 30; done
  [ "$DIMINTA_BERHENTI" -eq 0 ]
}

# Nomor log terbesar di LOGDIR (<n>.log atau <n>-<ke>.log), supaya jalan kedua di hari yang sama
# melanjutkan nomornya dan tidak menimpa log jalan sebelumnya. Kosong bila belum ada.
nomor_log_terakhir() {
  ls "$LOGDIR" 2>/dev/null | sed -nE 's/^([0-9]+)(-[0-9]+)?\.log$/\1/p' | sort -n | tail -1
}

# Baris "Iterasi selesai: <id> <status>" dari result sesi. $1 berkas log.
baris_selesai() {
  grep '"type":"result"' "$1" | tail -1 | jq -r '.result // ""' 2>/dev/null |
    grep -oE 'Iterasi selesai: [^ ]+ [a-z-]+' | tail -1
}

# Status CI terakhir di main: hijau, merah, atau tidak-diketahui (gh gagal, belum ada run, run dibatalkan,
# atau masih berjalan sesudah 30 menit). Run yang masih berjalan ditunggu dengan polling tiap 30 detik.
# Versi dengan `gh run watch` sempat membaca run yang masih berjalan sebagai merah (2026-10-10, --periksa);
# penyebabnya belum pasti (dengan stdin /dev/null `gh run watch` terbukti menunggu 243 detik), jadi skrip
# memakai polling yang langkahnya bisa dibaca, dan status selain completed:success tidak dianggap hijau.
status_main() {
  local run status kesimpulan
  for _ in $(seq 1 60); do
    run=$(gh run list --branch main --workflow cek --limit 1 --json status,conclusion 2>/dev/null)
    if [ -z "$run" ] || [ "$(jq 'length' <<<"$run" 2>/dev/null)" != 1 ]; then echo tidak-diketahui; return; fi
    status=$(jq -r '.[0].status // ""' <<<"$run")
    [ "$status" = completed ] && break
    sleep 30
  done
  kesimpulan=$(jq -r '.[0].conclusion // ""' <<<"$run")
  case "$status:$kesimpulan" in
    completed:success) echo hijau ;;
    completed:cancelled | completed:skipped | completed:) echo tidak-diketahui ;;
    completed:*) echo merah ;;
    *) echo tidak-diketahui ;;
  esac
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

# Sesi terakhir yang menulis plan/LAPORAN-PAGI.md. Kena batas pemakaian: tunggu sampai pulih + 2 menit
# selama jam pulih tidak lewat max(jam berhenti, sekarang) + TENGGANG_LAPORAN_MENIT, dan sesudah menunggu
# hanya lanjut bila checkout masih main bersih (kalau pemilik sudah bekerja di folder ini, jangan diganggu).
# Error lain: ulang sekali dengan MODEL_CADANGAN. Gagal -> tmp/LAPORAN-PAGI-darurat.md.
laporan_pagi() {
  local alasan="$1" jam log kode kelas prompt ke=1 gagal=0 model="$MODEL" batas_laporan dasar
  jam=$(date +%H%M)
  dasar=$(date +%s); [ "$BATAS" -gt "$dasar" ] && dasar=$BATAS
  batas_laporan=$((dasar + TENGGANG_LAPORAN_MENIT * 60))
  pulihkan
  prompt="Baca plan/PROTOKOL-OTOMATIS.md bagian \"Laporan pagi\" dan tulis laporan pagi. Alasan berhenti: $alasan. Loop mulai: $MULAI. Folder log: $LOGDIR. Kejadian skrip:
$(tail -40 "$KEJADIAN")"
  catat "laporan pagi: $alasan"
  while :; do
    log="$LOGDIR/laporan-pagi-$jam.log"; [ "$ke" -gt 1 ] && log="$LOGDIR/laporan-pagi-$jam-$ke.log"
    sesi "$prompt" "$model" "$log"; kode=$?
    kelas=$(nilai_sesi "$log" "$kode")
    [ "$kelas" = ok ] && break
    catat "sesi laporan pagi gagal ($kelas, kode $kode) · log ${log#$ROOT/}"
    pulihkan
    if [ "$kelas" = limit ]; then
      tunggu_pulih "$log" "$batas_laporan" || break
      pengaman 2>/dev/null || { catat "sesudah menunggu, checkout bukan main bersih; laporan tidak dijalankan"; kelas=dipakai; break; }
      model="$MODEL"
    else
      gagal=$((gagal + 1)); [ "$gagal" -ge 2 ] && break
      catat "ulang laporan pagi dengan $MODEL_CADANGAN"
      model="$MODEL_CADANGAN"
    fi
    ke=$((ke + 1))
  done
  [ "$kelas" = dipakai ] || pulihkan
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

# --- mulai ---
command -v claude >/dev/null || { echo "claude tidak ada di PATH" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq tidak ada di PATH" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh belum login (gh auth login)" >&2; exit 1; }
if [ "${1:-}" = "--periksa" ]; then periksa; exit $?; fi

pengaman || exit 1
python3 tools/antrean.py --check >/dev/null || { python3 tools/antrean.py --check; echo "BERHENTI: plan/ANTREAN.md tidak sah" >&2; exit 1; }
mkdir -p "$LOGDIR" "$ROOT/tmp"
if [ -f "$KUNCI" ] && kill -0 "$(cat "$KUNCI")" 2>/dev/null; then
  echo "BERHENTI: loop lain masih berjalan (pid $(cat "$KUNCI"))." >&2; exit 1
fi
echo $$ > "$KUNCI"
trap 'rm -f "$KUNCI"' EXIT
DIMINTA_BERHENTI=0
trap 'DIMINTA_BERHENTI=$((DIMINTA_BERHENTI + 1)); [ $DIMINTA_BERHENTI -ge 2 ] && exit 130' INT TERM

BATAS=$(hitung_batas) || { echo "BERHENTI_JAM tidak dikenali: $BERHENTI_JAM (format HH:MM)" >&2; exit 1; }
catat "mulai · model $MODEL (cadangan $MODEL_CADANGAN) · berhenti $(date -r "$BATAS" '+%Y-%m-%d %H:%M') · batas iterasi $BATAS_ITERASI"

# i = nomor iterasi untuk log dan kejadian (melanjutkan nomor terakhir hari ini); jalan = iterasi jalan ini.
i=$(nomor_log_terakhir); i=${i:-0}; jalan=0
tanpa_commit=0; parkir_berturut=0; merah_berturut=0; ALASAN=""
while :; do
  [ "$DIMINTA_BERHENTI" -gt 0 ] && { ALASAN="dihentikan pemilik (Ctrl-C)"; break; }
  [ "$BATAS_ITERASI" -gt 0 ] && [ "$jalan" -ge "$BATAS_ITERASI" ] && { ALASAN="batas $BATAS_ITERASI iterasi tercapai"; break; }
  [ "$(date +%s)" -ge "$BATAS" ] && { ALASAN="melewati jam berhenti $BERHENTI_JAM"; break; }
  pulihkan || { ALASAN="checkout tidak bisa dikembalikan ke main"; break; }
  [ "$(python3 tools/antrean.py sisa)" = 0 ] && { ALASAN="antrean habis"; break; }

  i=$((i + 1)); jalan=$((jalan + 1))
  tugas=$(python3 tools/antrean.py berikut 2>/dev/null | cut -f1)
  sebelum=$(git rev-parse origin/main)
  model="$MODEL"; gagal=0; ke=1
  while :; do
    log="$LOGDIR/$i.log"; [ "$ke" -gt 1 ] && log="$LOGDIR/$i-$ke.log"
    catat "iterasi $i percobaan $ke · tugas ${tugas:-?} · model $model · log ${log#$ROOT/}"
    sesi "$PROMPT" "$model" "$log"; kode=$?
    kelas=$(nilai_sesi "$log" "$kode")
    [ "$kelas" = ok ] && break
    catat "iterasi $i gagal: $kelas (kode $kode)"
    pulihkan
    [ "$DIMINTA_BERHENTI" -gt 0 ] && break
    if [ "$kelas" = limit ]; then
      # Batas pemakaian akun: tunggu sampai pulih + 2 menit, ulangi tugas yang sama dengan model utama.
      # Tidak menghitung percobaan tugas; menyerah hanya bila jam pulih lewat jam berhenti.
      tunggu_pulih "$log" "$BATAS" || {
        [ "$DIMINTA_BERHENTI" -gt 0 ] && break
        ALASAN="batas pemakaian baru pulih sesudah jam berhenti $BERHENTI_JAM"; break 2
      }
      model="$MODEL"; ke=$((ke + 1))
      continue
    fi
    gagal=$((gagal + 1))
    if [ "$gagal" -ge 2 ]; then
      parkir_dari_skrip "${tugas:-?}" "Sesi gagal dua kali ($kelas, kode $kode), terakhir dengan $model. Log: ${log#$ROOT/}." ||
        { ALASAN="tugas $tugas gagal dua kali dan tidak bisa diparkir otomatis"; break 2; }
      parkir_berturut=$((parkir_berturut + 1))
      kelas=diparkir
      break
    fi
    if [ $(( $(date +%s) + TUNGGU_DETIK )) -ge "$BATAS" ]; then
      ALASAN="iterasi $i gagal ($kelas) dan jam berhenti sudah dekat"; break 2
    fi
    catat "tunggu $TUNGGU_DETIK detik, lalu ulangi dengan $MODEL_CADANGAN"
    sleep "$TUNGGU_DETIK"
    [ "$DIMINTA_BERHENTI" -gt 0 ] && break
    model="$MODEL_CADANGAN"; ke=$((ke + 1))
  done
  [ "$DIMINTA_BERHENTI" -gt 0 ] && { ALASAN="dihentikan pemilik (Ctrl-C)"; break; }

  pulihkan
  if [ "$kelas" = ok ]; then
    selesai=$(baris_selesai "$log")
    catat "iterasi $i: ${selesai:-tanpa baris 'Iterasi selesai'}"
    st=$(awk '{print $4}' <<<"$selesai")
    case "$st" in
      diparkir) parkir_berturut=$((parkir_berturut + 1)) ;;
      selesai) parkir_berturut=0 ;;
      antrean-habis) ALASAN="antrean habis"; break ;;
    esac
  fi
  if [ "$(git rev-parse origin/main)" = "$sebelum" ]; then
    tanpa_commit=$((tanpa_commit + 1))
    catat "iterasi $i tanpa commit baru di main ($tanpa_commit/$MAKS_TANPA_COMMIT)"
    [ "$tanpa_commit" -ge "$MAKS_TANPA_COMMIT" ] && { ALASAN="$MAKS_TANPA_COMMIT iterasi berturut tanpa commit baru di main"; break; }
  else
    tanpa_commit=0
  fi
  [ "$parkir_berturut" -ge "$MAKS_PARKIR_BERTURUT" ] && { ALASAN="$MAKS_PARKIR_BERTURUT tugas diparkir berturut"; break; }
  if [ "$(status_main)" = merah ]; then
    merah_berturut=$((merah_berturut + 1))
    catat "main merah sesudah iterasi $i ($merah_berturut)"
    [ "$merah_berturut" -gt "$MAKS_MAIN_MERAH" ] && { ALASAN="main merah sesudah $MAKS_MAIN_MERAH iterasi perbaikan"; break; }
  else
    merah_berturut=0
  fi
done

catat "berhenti: $ALASAN"
laporan_pagi "$ALASAN"
catat "selesai · $(python3 tools/antrean.py ringkas | head -4 | tr '\n' ' ')"
