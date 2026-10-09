#!/usr/bin/env bash
# Digantikan tools/jalankan-otomatis.sh (keputusan 216); file ini dibiarkan sebagai arsip.
# Loop headless Tahap 1 (keputusan 140). Tahan ditinggal:
#   - tiap iterasi satu sesi `claude -p` baru untuk SATU halaman; kesinambungan dijaga
#     plan/MEMORI.md dan hook SessionStart di .claude/settings.json;
#   - claude keluar dengan error atau pesan rate limit -> tunggu 15 menit, ulangi;
#     paling banyak 12 kali berturut untuk satu iterasi;
#   - tiga iterasi berturut tanpa commit baru (`git rev-parse HEAD` tidak berubah) -> berhenti;
#   - plan/STATUS.md memuat "Tahap 1: selesai" -> satu iterasi terakhir dengan isi
#     plan/PROMPT-CROSSCHECK.md, lalu keluar.
# Log semua iterasi: log/tahap-1-<tanggal>.txt (log/ diabaikan git), ditulis langsung (stream-json).
# Pengaman: tidak mulai (dan tidak lanjut ke iterasi berikutnya) bila working tree kotor
# atau branch bukan main, supaya dua pekerja tidak menulis ke checkout yang sama.
#
# Flag dicek ke `claude --help` (2.1.292) dan https://code.claude.com/docs/en/cli-reference:
#   -p / --print                 non-interaktif: jalankan prompt, cetak hasil, keluar
#   --permission-mode <mode>     acceptEdits | auto | bypassPermissions | manual | dontAsk | plan
#                                Default di sini: auto. bypassPermissions sengaja tidak jadi default;
#                                kalau push/merge ditolak di mode auto, pemilik boleh memilih
#                                MODE_IZIN=bypassPermissions secara sadar.
#   --permission-prompts none    izin yang perlu ditanyakan langsung ditolak, sesi tidak menggantung
#   --max-turns <n>              batas turn agentic (mode print saja); ada di cli-reference,
#                                tidak tercetak di `--help` lokal 2.1.292
#   --max-budget-usd <n>         batas biaya per sesi (tercetak di `--help`)
#   --output-format stream-json  satu event JSON per baris saat sesi berjalan, jadi log terisi
#                                selama iterasi; contoh resmi -p selalu memasangkannya dengan --verbose
#
# Pemakaian:
#   bash tools/jalankan-tahap.sh            jalankan loop
#   bash tools/jalankan-tahap.sh --dry-run  cetak perintah dan keadaan, tanpa memanggil claude
# Variabel: MAKS_ULANG (12), TUNGGU_DETIK (900), MAKS_TANPA_COMMIT (3), MAKS_TURN (250),
#           MODE_IZIN (auto), BUDGET_USD (kosong = tanpa batas)
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROMPT_HALAMAN='lanjutkan: kerjakan SATU halaman berikutnya sesuai MEMORI sampai PR merge, perbarui MEMORI dan STATUS, lalu berhenti. Setelah halaman 1.42 merge dan tangkapan layar seluruh Tahap 1 sudah kamu lihat, tulis baris "Tahap 1: selesai" di plan/STATUS.md. Akhiri sesi di branch main dengan working tree bersih.'
CROSSCHECK="plan/PROMPT-CROSSCHECK.md"
MAKS_ULANG="${MAKS_ULANG:-12}"
TUNGGU_DETIK="${TUNGGU_DETIK:-900}"
MAKS_TANPA_COMMIT="${MAKS_TANPA_COMMIT:-3}"
MAKS_TURN="${MAKS_TURN:-250}"
MODE_IZIN="${MODE_IZIN:-auto}"
BUDGET_USD="${BUDGET_USD:-}"
# Pesan limit hanya dicari di 5 baris terakhir output, supaya teks halaman tidak salah terbaca.
POLA_LIMIT='rate.?limit|usage limit|limit reached|overloaded|API Error: (429|5[0-9][0-9])|"is_error": ?true'
LOG="$ROOT/log/tahap-1-$(date +%Y-%m-%d).txt"

OPSI=(--permission-mode "$MODE_IZIN" --permission-prompts none --max-turns "$MAKS_TURN" --output-format stream-json --verbose)
[ -n "$BUDGET_USD" ] && OPSI+=(--max-budget-usd "$BUDGET_USD")

selesai() { grep -q 'Tahap 1: selesai' plan/STATUS.md; }
catat() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

# Satu sesi claude dengan ulang otomatis saat error atau rate limit. Keluar 0 bila sesi selesai normal.
jalankan() {
  local prompt="$1" label="$2" ulang=0 awal
  while :; do
    catat "mulai $label (ulang $ulang/$MAKS_ULANG)"
    awal=$(wc -l < "$LOG")
    claude -p "$prompt" "${OPSI[@]}" >> "$LOG" 2>&1
    local kode=$?
    if [ $kode -eq 0 ] && ! tail -n +"$((awal + 1))" "$LOG" | tail -5 | grep -qiE "$POLA_LIMIT"; then
      tail -n +"$((awal + 1))" "$LOG" | grep -oE 'Siap dilanjutkan dari [0-9]+\.[0-9]+' | tail -1 | sed 's/^/  tanda: /' | tee -a "$LOG"
      return 0
    fi
    ulang=$((ulang + 1))
    if [ $ulang -gt "$MAKS_ULANG" ]; then
      catat "BERHENTI: $label gagal $MAKS_ULANG kali berturut (kode terakhir $kode)."
      return 1
    fi
    catat "$label gagal (kode $kode) atau kena rate limit; tunggu $TUNGGU_DETIK detik."
    sleep "$TUNGGU_DETIK"
  done
}

# Keluar dengan pesan jelas bila checkout tidak siap untuk sesi baru.
pengaman() {
  local branch kotor
  branch=$(git branch --show-current)
  kotor=$(git status --porcelain)
  if [ -n "$kotor" ]; then
    echo "BERHENTI: working tree tidak bersih. Commit atau stash dulu (git stash push -u -m <nama>):" >&2
    echo "$kotor" | head -20 >&2
    return 1
  fi
  if [ "$branch" != "main" ]; then
    echo "BERHENTI: branch sekarang '${branch:-detached}', bukan main. Jalankan: git checkout main && git pull" >&2
    return 1
  fi
}

if [ "${1:-}" = "--dry-run" ]; then
  pengaman && echo "pengaman: main, working tree bersih" || exit 1
  command -v claude >/dev/null || { echo "claude tidak ditemukan di PATH" >&2; exit 1; }
  echo "claude: $(claude --version)"
  echo "halaman:    claude -p <PROMPT_HALAMAN> $(printf '%q ' "${OPSI[@]}")"
  echo "crosscheck: claude -p \"\$(cat $CROSSCHECK)\" $(printf '%q ' "${OPSI[@]}")"
  [ -s "$CROSSCHECK" ] && echo "$CROSSCHECK: $(wc -l < "$CROSSCHECK") baris" || echo "PERINGATAN: $CROSSCHECK tidak ada"
  if selesai; then echo "STATUS: Tahap 1 selesai -> langsung crosscheck"; else echo "STATUS: belum selesai -> loop halaman"; fi
  echo "HEAD: $(git rev-parse --short HEAD) · log: $LOG"
  echo "batas: ulang $MAKS_ULANG x $TUNGGU_DETIK detik, berhenti setelah $MAKS_TANPA_COMMIT iterasi tanpa commit"
  exit 0
fi

pengaman || exit 1
mkdir -p "$(dirname "$LOG")"
tanpa_commit=0
i=0
while ! selesai; do
  i=$((i + 1))
  pengaman || { catat "BERHENTI sebelum iterasi $i: checkout tidak siap (lihat pesan di atas)."; exit 1; }
  sebelum=$(git rev-parse HEAD)
  jalankan "$PROMPT_HALAMAN" "iterasi $i" || exit 1
  if [ "$(git rev-parse HEAD)" = "$sebelum" ]; then
    tanpa_commit=$((tanpa_commit + 1))
    catat "iterasi $i tanpa commit baru ($tanpa_commit/$MAKS_TANPA_COMMIT)"
    if [ $tanpa_commit -ge "$MAKS_TANPA_COMMIT" ]; then
      catat "BERHENTI: $MAKS_TANPA_COMMIT iterasi berturut tanpa commit. Baca $LOG dan plan/MEMORI.md."
      exit 1
    fi
  else
    tanpa_commit=0
  fi
done

catat "STATUS memuat 'Tahap 1: selesai'. Iterasi terakhir: crosscheck."
[ -s "$CROSSCHECK" ] || { catat "BERHENTI: $CROSSCHECK tidak ada."; exit 1; }
jalankan "$(cat "$CROSSCHECK")" "crosscheck" || exit 1
catat "Selesai. Hasil di plan/LAPORAN-TAHAP-1.md."
