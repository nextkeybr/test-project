#!/bin/bash
# AI 오피스 설치 / 업데이트 (맥용)
# 처음 설치:  curl -fsSL https://raw.githubusercontent.com/nextkeybr/test-project/claude/ecstatic-lovelace-echyjs/ai-office/install-mac.sh | bash
# 업데이트:   사무실 화면의 "새 버전 업데이트" 버튼 (또는 위 명령을 다시 실행)
# 내 데이터(채팅 기록, 결과물, 캐릭터 이미지, agents.local.json, role.local.md)는 지우지 않습니다.
set -e

DEST="${AI_OFFICE_DIR:-$HOME/AI-Office}"
BRANCH="claude/ecstatic-lovelace-echyjs"
URL="https://codeload.github.com/nextkeybr/test-project/tar.gz/refs/heads/$BRANCH"
MODE="install"
[ "$1" = "--update" ] && MODE="update"

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js 가 없습니다. https://nodejs.org 에서 설치한 뒤 다시 실행해 주세요."
  exit 1
fi

echo "⬇️  최신 버전 받는 중..."
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "$URL" | tar -xz -C "$TMP"
SRC="$(find "$TMP" -maxdepth 2 -type d -name ai-office | head -1)"
if [ -z "$SRC" ]; then echo "❌ 받은 파일에서 ai-office 폴더를 찾지 못했습니다."; exit 1; fi

mkdir -p "$DEST"
# 받은 파일에는 내 데이터가 들어있지 않으므로, 그대로 덮어써도 내 데이터는 남습니다
cp -R "$SRC/." "$DEST/"
echo "✅ 파일 설치 완료: $DEST (버전 $(cat "$DEST/VERSION" 2>/dev/null))"

# 바탕화면 실행 아이콘 만들기 (내 컴퓨터에서 만든 파일이라 보안 경고가 뜨지 않습니다)
LAUNCHER="$HOME/Desktop/AI오피스.command"
# 업데이트 때는 지금 실행 중인 실행 파일을 건드리지 않습니다 (덮어쓰면 실행 중인 창이 꼬일 수 있음)
if [ "$MODE" = "update" ] && [ -f "$DEST/AI오피스.command" ]; then
  echo "✅ 업데이트 완료"
  exit 0
fi
mkdir -p "$HOME/Desktop"
cat > "$LAUNCHER" <<EOF
#!/bin/zsh -l
# AI 오피스 실행 — 이 창을 닫으면 사무실도 꺼집니다.
[ -f "\$HOME/.zshrc" ] && source "\$HOME/.zshrc" >/dev/null 2>&1
export PATH="\$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:\$PATH"
cd "$DEST" || { echo "AI 오피스 폴더가 없습니다: $DEST"; read; exit 1; }
export OFFICE_OPEN=1
while true; do
  node server.js
  [ \$? -eq 42 ] || break
  export OFFICE_OPEN=0
  echo "🔄 새 버전으로 다시 여는 중..."
done
EOF
chmod +x "$LAUNCHER"
cp "$LAUNCHER" "$DEST/AI오피스.command"

if [ "$MODE" = "install" ]; then
  echo ""
  echo "🎉 설치 끝! 바탕화면의 'AI오피스' 아이콘을 더블클릭하면 사무실이 열립니다."
  echo "   지금 바로 열어 드릴게요..."
  open "$LAUNCHER" 2>/dev/null || true
fi
