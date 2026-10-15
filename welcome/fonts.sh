#!/usr/bin/env bash
# Installs the fonts reel.html expects (Pretendard + Noto fallbacks for Thai/Devanagari/Arabic/Chinese).
set -euo pipefail
DEST="$HOME/.fonts/kr"; TMP="$(mktemp -d)"; mkdir -p "$DEST"
curl -sSfL -o "$TMP/p.zip" https://github.com/orioncactus/pretendard/releases/download/v1.3.9/Pretendard-1.3.9.zip
unzip -q "$TMP/p.zip" -d "$TMP/p" && cp "$TMP"/p/public/static/Pretendard-*.otf "$DEST/"
G=https://raw.githubusercontent.com/google/fonts/main/ofl
for f in notosansthai/NotoSansThai notosansdevanagari/NotoSansDevanagari notosansarabic/NotoSansArabic; do
  curl -sSfL -o "$DEST/$(basename $f).ttf" "$G/$f%5Bwdth,wght%5D.ttf"
done
curl -sSfL -o "$DEST/NotoSansSC.ttf" "$G/notosanssc/NotoSansSC%5Bwght%5D.ttf"
fc-cache -f >/dev/null && echo "fonts installed in $DEST"
