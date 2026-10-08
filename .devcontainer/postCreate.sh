#!/usr/bin/env bash
# Dijalankan sekali setelah Dev Container dibuat. Dart dipasang lewat repositori apt resmi
# (https://dart.dev/get-dart), karena belum ada feature Dev Container resmi untuk Dart (keputusan 101).
set -euo pipefail
ARCH=$(dpkg --print-architecture)
sudo apt-get update -q
sudo apt-get install -y -q apt-transport-https gpg
wget -qO- https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmor -o /usr/share/keyrings/dart.gpg
echo "deb [signed-by=/usr/share/keyrings/dart.gpg arch=$ARCH] https://storage.googleapis.com/download.dartlang.org/linux/debian stable main" \
  | sudo tee /etc/apt/sources.list.d/dart_stable.list >/dev/null
sudo apt-get update -q && sudo apt-get install -y -q dart
echo 'export PATH="$PATH:/usr/lib/dart/bin"' >> ~/.bashrc
# Situs: venv + dependency MkDocs; lab: venv labs/.venv.
python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt
make -C labs/b3-race setup
echo "Dev Container siap. Jalankan: make lab"
