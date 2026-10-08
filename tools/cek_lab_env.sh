#!/usr/bin/env bash
# Memeriksa alat yang dibutuhkan lab (README "Yang dibutuhkan"). Dipanggil `make lab`.
# Alat yang hilang dicetak beserta perintah pemasangannya; exit 1 kalau ada yang wajib hilang.
# Dart dan PHP tidak menghalangi: hanya sebagian lab yang memakainya.
set -uo pipefail
OS=$(uname -s)
gagal=0
cek() { # nama perintah | wajib(1/0) | cara pasang macOS | cara pasang Debian/Ubuntu | perintah versi
  local nama=$1 wajib=$2 mac=$3 deb=$4 versi=$5
  if command -v "$nama" >/dev/null 2>&1; then
    printf '  ok      %-8s %s\n' "$nama" "$(eval "$versi" 2>/dev/null | head -1)"
  else
    if [ "$wajib" = 1 ]; then printf '  HILANG  %-8s' "$nama"; gagal=1; else printf '  opsional %-7s' "$nama"; fi
    if [ "$OS" = Darwin ]; then echo " pasang: $mac"; else echo " pasang: $deb"; fi
  fi
}
echo "== alat lab"
cek docker  1 "https://docs.docker.com/desktop/setup/install/mac-install/" "https://docs.docker.com/engine/install/" "docker --version"
cek go      1 "brew install go"            "https://go.dev/doc/install"                           "go version"
cek node    1 "brew install node@22"       "https://nodejs.org/en/download"                       "node --version"
cek python3 1 "brew install python@3.14"   "sudo apt-get install python3 python3-venv"            "python3 --version"
cek dart    0 "brew install dart-lang/dart/dart atau Flutter SDK" "https://dart.dev/get-dart (apt)" "dart --version"
cek php     0 "brew install php composer"  "sudo apt-get install php-cli composer"                "php --version"
if command -v docker >/dev/null 2>&1; then
  if docker compose version >/dev/null 2>&1; then printf '  ok      %-8s %s\n' compose "$(docker compose version)"
  else echo "  HILANG  compose   Docker Compose v2 (plugin 'docker compose') tidak ada"; gagal=1; fi
  if ! docker info >/dev/null 2>&1; then echo "  HILANG  daemon    Docker tidak berjalan; jalankan Docker Desktop / dockerd"; gagal=1; fi
fi
[ "$gagal" = 0 ] || { echo "GAGAL: pasang alat yang HILANG dulu, lalu ulangi make lab"; exit 1; }
