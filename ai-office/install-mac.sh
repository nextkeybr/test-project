#!/bin/bash
# AI 오피스 설치 / 업데이트 (맥용)
# 처음 설치:  curl -fsSL https://raw.githubusercontent.com/nextkeybr/test-project/claude/ecstatic-lovelace-echyjs/ai-office/install-mac.sh | bash
# 업데이트:   사무실 화면의 "새 버전 업데이트" 버튼 (또는 위 명령을 다시 실행)
# 필요한 프로그램(Node.js, Claude Code, Codex)이 없으면 알아서 설치합니다. 관리자 비밀번호는 필요 없습니다.
# 내 데이터(채팅 기록, 결과물, 캐릭터 이미지, 내 설정)는 지우지 않습니다.

DEST="${AI_OFFICE_DIR:-$HOME/AI-Office}"
BRANCH="claude/ecstatic-lovelace-echyjs"
URL="https://codeload.github.com/nextkeybr/test-project/tar.gz/refs/heads/$BRANCH"
MODE="install"
[ "$1" = "--update" ] || [ "$AI_OFFICE_UPDATE" = "1" ] && MODE="update"

mkdir -p "$DEST"
LOG="$DEST/install-log.txt"
[ "$MODE" = "install" ] && exec > >(tee -a "$LOG") 2>&1
echo "===== $(date) 설치 시작 ($MODE) ====="

fail() {
  echo ""
  echo "❌ $1"
  echo "   👉 해결 방법: $2"
  echo "   그래도 안 되면 이 파일을 보내주세요: $LOG"
  exit 1
}
step() { echo ""; echo "[$1] $2"; }

export PATH="$DEST/runtime/node/bin:$DEST/runtime/npm/bin:$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

step "1/5" "인터넷 연결 확인"
curl -fsI https://codeload.github.com >/dev/null 2>&1 || fail "인터넷에 연결할 수 없어요." "와이파이를 확인하고 이 명령을 다시 실행해 주세요."

step "2/5" "AI 오피스 파일 받기"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
curl -fsSL "$URL" | tar -xz -C "$TMP" || fail "파일을 받지 못했어요." "잠시 뒤에 다시 실행해 주세요."
SRC="$(find "$TMP" -maxdepth 2 -type d -name ai-office | head -1)"
[ -n "$SRC" ] || fail "받은 파일이 이상해요." "잠시 뒤에 다시 실행해 주세요."
# 받은 파일에는 내 데이터가 들어있지 않으므로, 그대로 덮어써도 내 데이터는 남습니다
cp -R "$SRC/." "$DEST/" || fail "파일을 복사하지 못했어요." "사무실이 켜져 있다면 끄고 다시 실행해 주세요."
echo "   ✅ 버전 $(cat "$DEST/VERSION" 2>/dev/null)"

if [ "$MODE" = "update" ]; then
  echo "✅ 업데이트 완료"
  exit 0
fi

step "3/5" "Node.js 준비 (사무실을 돌리는 엔진)"
NODE_OK=0
if command -v node >/dev/null 2>&1; then
  MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)"
  [ "${MAJOR:-0}" -ge 18 ] 2>/dev/null && NODE_OK=1
fi
if [ "$NODE_OK" = "1" ]; then
  echo "   ✅ 이미 있어요 ($(node -v))"
else
  ARCH="$(uname -m)"; [ "$ARCH" = "arm64" ] && NA="arm64" || NA="x64"
  VER="$(curl -fsSL https://nodejs.org/dist/index.json | grep '"lts":"' | head -1 | sed -E 's/.*"version":"(v[0-9.]+)".*/\1/')"
  [ -n "$VER" ] || fail "Node.js 버전 정보를 받지 못했어요." "잠시 뒤에 다시 실행해 주세요."
  echo "   ⬇️  Node.js $VER 받는 중..."
  mkdir -p "$DEST/runtime/node"
  curl -fsSL "https://nodejs.org/dist/$VER/node-$VER-darwin-$NA.tar.gz" | tar -xz -C "$DEST/runtime/node" --strip-components 1 \
    || fail "Node.js를 받지 못했어요." "https://nodejs.org 에서 직접 설치한 뒤 이 명령을 다시 실행해 주세요."
  node -v >/dev/null 2>&1 || fail "Node.js가 실행되지 않아요." "https://nodejs.org 에서 직접 설치한 뒤 다시 실행해 주세요."
  echo "   ✅ 설치 완료 ($(node -v))"
fi

step "4/5" "AI 프로그램 준비 (Claude Code, Codex)"
if command -v claude >/dev/null 2>&1; then
  echo "   ✅ Claude Code 이미 있어요"
else
  echo "   ⬇️  Claude Code 설치 중..."
  curl -fsSL https://claude.ai/install.sh | bash || true
  command -v claude >/dev/null 2>&1 && echo "   ✅ Claude Code 설치 완료" || echo "   ⚠️  Claude Code 설치가 끝나지 않았어요. 사무실의 '🩺 시작 준비'에서 다시 시도할 수 있어요."
fi
if command -v codex >/dev/null 2>&1; then
  echo "   ✅ Codex 이미 있어요"
else
  echo "   ⬇️  Codex 설치 중..."
  npm install -g --prefix "$DEST/runtime/npm" @openai/codex@latest >/dev/null 2>&1 || true
  command -v codex >/dev/null 2>&1 && echo "   ✅ Codex 설치 완료" || echo "   ⚠️  Codex 설치가 끝나지 않았어요. 사무실의 '🩺 시작 준비'에서 다시 시도할 수 있어요."
fi

step "5/5" "바탕화면 아이콘 만들기"
LAUNCHER="$HOME/Desktop/AI오피스.command"
mkdir -p "$HOME/Desktop"
cat > "$LAUNCHER" <<EOF
#!/bin/zsh -l
# AI 오피스 실행 — 이 창을 닫으면 사무실도 꺼집니다.
[ -f "\$HOME/.zshrc" ] && source "\$HOME/.zshrc" >/dev/null 2>&1
export PATH="$DEST/runtime/node/bin:$DEST/runtime/npm/bin:\$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:\$PATH"
cd "$DEST" || { echo "AI 오피스 폴더가 없습니다: $DEST"; exit 1; }
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
echo "   ✅ 바탕화면에 'AI오피스' 아이콘을 만들었어요"

echo ""
echo "🎉 설치 끝! 사무실을 열어 드릴게요."
echo "   처음 열리면 '🩺 시작 준비' 창에서 [로그인하기] 버튼만 누르면 됩니다."
echo "   다음부터는 바탕화면의 'AI오피스' 아이콘을 더블클릭하세요."
open "$LAUNCHER" 2>/dev/null || true
