#!/usr/bin/env bash
# Unduh font resmi ke folder proyek (bukan instalasi sistem).
# Satoshi: Fontshare, ITF Free Font License (FFL) v2.0. Boleh self-host untuk situs sendiri,
#          TIDAK boleh diredistribusi, dimodifikasi, atau di-subset (lihat situs/public/fonts/Satoshi-FFL.txt setelah diunduh).
# JetBrains Mono: GitHub resmi JetBrains, SIL Open Font License 1.1.
set -e
cd "$(dirname "$0")/.."
T=$(mktemp -d)
curl -sSL -o "$T/satoshi.zip" "https://api.fontshare.com/v2/fonts/download/satoshi"
curl -sSL -o "$T/jbm.zip" "https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip"
unzip -oq "$T/satoshi.zip" -d "$T" && unzip -oq "$T/jbm.zip" -d "$T/jbm"
W="$T/Satoshi_Complete/Fonts/WEB/fonts"
mkdir -p situs/public/fonts
cp "$W/Satoshi-Variable.woff2" "$W/Satoshi-VariableItalic.woff2" situs/public/fonts/
cp "$T/Satoshi_Complete/License/FFL.txt" situs/public/fonts/Satoshi-FFL.txt
cp "$T"/jbm/fonts/webfonts/JetBrainsMono-{Regular,Bold,Italic}.woff2 situs/public/fonts/
cp "$T/jbm/OFL.txt" situs/public/fonts/JetBrainsMono-OFL.txt
rm -rf "$T"
echo "Font siap."
