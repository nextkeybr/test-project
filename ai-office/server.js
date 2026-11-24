// AI 오피스 서버 — 외부 패키지 없이 Node.js만으로 동작합니다.
// 직원(에이전트) 한 명 = 터미널 AI 프로그램(claude / codex / gemini) 한 개.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execFile } = require('child_process');

const ROOT = __dirname;
// agents.json = 기본 설정 (업데이트로 바뀜). agents.local.json = 내 설정 (업데이트해도 안 바뀜)
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, '')); // 메모장 등이 붙이는 BOM 제거
const CFG = readJson(path.join(ROOT, 'agents.json'));
try {
  const local = readJson(path.join(ROOT, 'agents.local.json'));
  Object.assign(CFG.settings, local.settings || {});
  for (const [k, v] of Object.entries(local.engines || {})) CFG.engines[k] = { ...(CFG.engines[k] || {}), ...v };
  for (const la of local.agents || []) {
    const base = CFG.agents.find((x) => x.id === la.id);
    if (base) Object.assign(base, la); else CFG.agents.push(la);
  }
} catch (e) {
  if (e.code !== 'ENOENT') console.log('⚠️ agents.local.json 을 읽지 못했습니다 (쉼표·따옴표 확인):', e.message);
}
const VERSION = (() => { try { return fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim(); } catch { return 'dev'; } })();
const REPO_RAW = 'https://raw.githubusercontent.com/nextkeybr/test-project/claude/ecstatic-lovelace-echyjs/ai-office';
const SET = CFG.settings;
const MOCK = process.env.OFFICE_MOCK === '1' || process.argv.includes('--mock');
const PORT = Number(process.env.PORT) || SET.port || 3939;
const IS_WIN = process.platform === 'win32';

const AGENTS_DIR = path.join(ROOT, 'agents');
const SHARED = path.join(ROOT, 'shared');
const DATA = path.join(ROOT, 'data');
const PUBLIC = path.join(ROOT, 'public');
const LEAD = SET.leadAgent;
const os = require('os');
// 설치 프로그램이 넣어둔 Node·Codex, Claude Code 기본 설치 위치를 찾을 수 있게 PATH 앞에 추가
const RUNTIME = path.join(ROOT, 'runtime');
const NPM_PREFIX = path.join(RUNTIME, 'npm');
const extraPath = IS_WIN
  ? [path.join(RUNTIME, 'node'), NPM_PREFIX, path.join(RUNTIME, 'git', 'cmd'), path.join(os.homedir(), '.local', 'bin')]
  : [path.join(RUNTIME, 'node', 'bin'), path.join(NPM_PREFIX, 'bin'), path.join(os.homedir(), '.local', 'bin'), '/opt/homebrew/bin', '/usr/local/bin'];
process.env.PATH = [...extraPath, process.env.PATH].join(path.delimiter);
// 윈도우: 설치 프로그램이 받아 둔 휴대용 Git을 Claude Code가 쓰도록 알려줌
const PORTABLE_BASH = path.join(RUNTIME, 'git', 'bin', 'bash.exe');
if (IS_WIN && !process.env.CLAUDE_CODE_GIT_BASH_PATH && fs.existsSync(PORTABLE_BASH)) process.env.CLAUDE_CODE_GIT_BASH_PATH = PORTABLE_BASH;

// ---------- 오류를 쉬운 말로 바꾸기 ----------
function explainError(text) {
  const t = String(text || '');
  const rules = [
    [/'?winget'? is not recognized|winget.*(not found|찾을 수 없)/i, '이 PC에는 winget(앱 설치 도구)이 없어요', 'Microsoft Store에서 "앱 설치 관리자(App Installer)"를 업데이트한 뒤 다시 눌러 주세요. ffmpeg은 선택 사항이라 없어도 사무실은 쓸 수 있어요.', null],
    [/ENOENT|is not recognized|not recognized as|command not found|찾을 수 없습니다|No such file or directory.*(claude|codex)/i, '프로그램이 설치되어 있지 않아요', '🩺 시작 준비 창에서 [설치하기]를 눌러 주세요.', 'setup'],
    [/not logged in|log ?in required|please (log|sign) ?in|unauthori[sz]ed|\b401\b|invalid.*(token|credential)|auth(entication)? (failed|error)|expired.*token|token.*expired|run .*login/i, 'AI 로그인이 풀렸어요', '🩺 시작 준비 창에서 [로그인하기]를 눌러 다시 로그인해 주세요.', 'setup'],
    [/rate.?limit|usage limit|quota|\b429\b|too many requests|limit reached|exceeded your|weekly limit|5-hour limit/i, 'AI 사용량 한도에 걸렸어요', '잠시 뒤에 다시 시키거나, ⚙️ 직원 관리에서 이 직원의 AI를 다른 것으로 바꿔 주세요.', 'manager'],
    [/ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|getaddrinfo|network error|fetch failed|socket hang up|offline/i, '인터넷 연결에 문제가 있어요', '와이파이·인터넷 연결을 확인하고 다시 시켜 주세요.', null],
    [/git bash|requires git|git for windows|git-bash/i, 'Git 프로그램이 필요해요 (윈도우)', '🩺 시작 준비 창에서 [Git 설치하기]를 눌러 주세요.', 'setup'],
    [/EACCES|EPERM|permission denied|access is denied|권한/i, '권한 문제로 막혔어요', '사무실을 껐다가 다시 켜 보세요. 계속되면 AI-Office 폴더를 다른 프로그램이 쓰고 있지 않은지 확인해 주세요.', null],
    [/ENOSPC|no space left|disk full/i, '저장 공간이 부족해요', '필요 없는 파일을 지워 저장 공간을 확보해 주세요.', null],
    [/unexpected argument|unknown option|unrecognized option|invalid value for/i, 'AI 프로그램 버전이 맞지 않아요', '🩺 시작 준비 창에서 그 AI를 [업데이트]해 주세요. 그래도 안 되면 사무실 업데이트를 확인해 주세요.', 'setup'],
    [/timed? ?out|시간 초과/i, '작업이 너무 오래 걸려 멈췄어요', '일을 더 작게 나눠서 다시 시켜 보세요.', null],
  ];
  for (const [re, title, fix, action] of rules) if (re.test(t)) return { title, fix, action };
  return null;
}

for (const d of [SHARED, DATA]) fs.mkdirSync(d, { recursive: true });

// ---------- 상태 ----------
const agents = {}; // id -> { cfg, dir, off, current, queue, lastLine, log }
const order = [];
function setupAgent(a) {
  const dir = path.join(AGENTS_DIR, a.id);
  for (const sub of ['inbox', 'done', 'output', 'shared']) fs.mkdirSync(path.join(dir, sub), { recursive: true });
  // role.md(원본) → 엔진별 설명서 파일(CLAUDE.md / AGENTS.md / GEMINI.md)로 복사. role.local.md 가 있으면 그걸 우선 사용
  const rolePath = fs.existsSync(path.join(dir, 'role.local.md')) ? path.join(dir, 'role.local.md') : path.join(dir, 'role.md');
  // 대체 AI로 넘어갈 때를 대비해 모든 AI용 설명서를 만들어 둠
  if (fs.existsSync(rolePath)) for (const e of Object.values(CFG.engines)) if (e.roleFile) fs.copyFileSync(rolePath, path.join(dir, e.roleFile));
  agents[a.id] = { cfg: a, dir, off: false, current: null, queue: [], lastLine: '', log: [] };
  order.push(a.id);
}
for (const a of CFG.agents) if (!a.removed) setupAgent(a);

// ---------- 내 설정 파일 (agents.local.json) 읽기/쓰기 ----------
const LOCAL_PATH = path.join(ROOT, 'agents.local.json');
function readLocal() {
  try { return readJson(LOCAL_PATH); } catch (e) {
    if (e.code === 'ENOENT') return {};
    throw new Error('agents.local.json 파일 형식이 잘못돼 저장하지 못했어요');
  }
}
function updateLocalAgent(id, patch) {
  const local = readLocal();
  local.agents = Array.isArray(local.agents) ? local.agents : [];
  let entry = local.agents.find((x) => x.id === id);
  if (!entry) { entry = { id }; local.agents.push(entry); }
  if (patch === null) local.agents = local.agents.filter((x) => x.id !== id);
  else Object.assign(entry, patch);
  fs.writeFileSync(LOCAL_PATH, JSON.stringify(local, null, 2));
}

// ---------- 설치된 AI 확인 ----------
const engineAvail = {};
function checkEngine(key) {
  const e = CFG.engines[key];
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; engineAvail[key] = v; resolve(v); } };
    try {
      const c = spawn(e.cmd, ['--version'], { shell: IS_WIN, windowsHide: true });
      c.on('error', () => finish(false));
      c.on('close', (code) => finish(code === 0));
      setTimeout(() => { try { c.kill(); } catch {} finish(false); }, 20000);
    } catch { finish(false); }
  });
}
Object.keys(CFG.engines).forEach(checkEngine);
const enginesInfo = () => Object.entries(CFG.engines).map(([key, e]) => ({ key, label: e.label || key, available: MOCK ? true : engineAvail[key] }));
const CHAR_TYPES = ['bunny', 'bear', 'cat', 'dog', 'hamster', 'chick'];
const ROLE_TEMPLATE = (name, role, details) => `# 역할: ${name}

너는 AI 오피스의 ${name}다. ${role}

## 하는 일
- ${role}
${details ? '\n## 자세한 업무 설명\n' + details + '\n' : ''}
## 결과물 기준
- 결과는 반드시 output/ 폴더에 파일로 저장한다.
- 결론부터, 짧고 쉬운 말로 보고한다.
- 사실과 추측을 구분한다. 확인하지 못한 것은 확인하지 못했다고 쓴다.
- 게시, 발송, 결제, 배포처럼 밖으로 나가는 일은 하지 않고 대표님께 보고만 한다.
`;

const jobs = {};
let chat = [];
const CHAT_FILE = path.join(DATA, 'chat.json');
try { chat = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8')); } catch { chat = []; }
let saveTimer = null;
function saveChat() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    chat = chat.slice(-500);
    fs.writeFile(CHAT_FILE, JSON.stringify(chat, null, 1), () => {});
  }, 300);
}

// 결과물 파일 정보: 누가, 어떤 요청으로 만들었는지 (이어서 하기 선택 창에서 묶어 보여줌)
const META_FILE = path.join(DATA, 'files-meta.json');
let filesMeta = {};
try { filesMeta = JSON.parse(fs.readFileSync(META_FILE, 'utf8')); } catch { filesMeta = {}; }
function saveMeta() { fs.writeFile(META_FILE, JSON.stringify(filesMeta, null, 1), () => {}); }
function filesWithMeta() {
  return listFiles(SHARED).map((f) => ({ ...f, ...(filesMeta[f.path] || {}) }));
}

let seq = 0;
const newId = (p) => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${p}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}-${++seq}`;
};

// ---------- 실시간 전송 (SSE) ----------
const clients = new Set();
function emit(type, data) {
  const msg = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
}

function imageFor(id, suffix) {
  for (const ext of ['png', 'webp', 'gif', 'jpg', 'jpeg']) {
    const f = `characters/${id}${suffix}.${ext}`;
    const abs = path.join(PUBLIC, f);
    if (fs.existsSync(abs)) return `${f}?v=${Math.round(fs.statSync(abs).mtimeMs)}`;
  }
  return null;
}

function snapshot(id) {
  const a = agents[id];
  const status = a.current ? 'working' : a.off ? 'off' : a.queue.length ? 'waiting' : 'idle';
  const engineKey = a.cfg.engine;
  return {
    ...a.cfg,
    engineLabel: MOCK ? `연습 모드 (${CFG.engines[engineKey]?.label || engineKey})` : CFG.engines[engineKey]?.label || engineKey,
    status,
    off: a.off,
    queue: a.queue.length,
    lastLine: a.lastLine,
    current: a.current ? { instruction: a.current.instruction.slice(0, 120), startedAt: a.current.startedAt, engine: a.current.engine || engineKey } : null,
    image: imageFor(id, ''),
    workImage: imageFor(id, '-work'),
  };
}
const pushAgent = (id) => emit('agent', snapshot(id));

function addChat(m) {
  const msg = { id: newId('m'), time: Date.now(), files: [], ...m };
  chat.push(msg);
  saveChat();
  emit('chat', msg);
  return msg;
}

function log(id, line) {
  const a = agents[id];
  line = String(line).replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').replace(/\r/g, '').trimEnd();
  if (!line.trim()) return;
  a.log.push(line);
  if (a.log.length > 400) a.log.splice(0, a.log.length - 400);
  a.lastLine = line.trim().slice(0, 140);
  emit('log', { id, line });
  pushAgent(id);
}

// ---------- 업무(Job/Task) ----------
const nameOf = (id) => (agents[id] ? `${agents[id].cfg.name} ${agents[id].cfg.nickname || ''}`.trim() : id);

function resolveAgent(word) {
  if (!word) return null;
  const w = word.toLowerCase();
  return order.find((id) => {
    const c = agents[id].cfg;
    return id === w || c.name === word || c.nickname === word || `${c.name}${c.nickname}` === word;
  }) || null;
}

function createJob(to, text, attachments = []) {
  const job = { id: newId('job'), owner: to, round: 1, open: new Set(), results: [], userText: text, needsReview: false, attachments };
  jobs[job.id] = job;
  enqueue(to, { kind: to === LEAD ? 'lead' : 'direct', instruction: text, from: 'me', job, canDelegate: to === LEAD });
}

function enqueue(agentId, t) {
  const task = { id: newId('task'), agentId, createdAt: Date.now(), ...t };
  task.jobId = t.job.id;
  delete task.job;
  agents[agentId].queue.push(task);
  jobs[task.jobId].open.add(task.id);
  pushAgent(agentId);
  pump();
}

function runningCount() { return order.filter((id) => agents[id].current).length; }

function pump() {
  for (const id of order) {
    if (runningCount() >= (SET.maxParallel || 3)) break;
    const a = agents[id];
    if (!a.off && !a.current && a.queue.length) startTask(a, a.queue.shift());
  }
  order.forEach(pushAgent);
}

// 결과물로 취급하지 않는 폴더/파일 (용량이 크거나 의미 없는 것)
const SKIP = new Set(['node_modules', '.git', '.venv', 'venv', '__pycache__', '.next', '.cache', 'dist-ssr', '.DS_Store']);

function copyNewer(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    try {
      if (e.isDirectory()) copyNewer(s, d);
      else if (e.isFile() && (!fs.existsSync(d) || fs.statSync(s).mtimeMs > fs.statSync(d).mtimeMs)) fs.copyFileSync(s, d);
    } catch {}
  }
}

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    try {
      if (e.isDirectory()) out = out.concat(listFiles(p, base));
      else if (e.isFile()) {
        const st = fs.statSync(p);
        out.push({ path: path.relative(base, p).split(path.sep).join('/'), size: st.size, mtime: st.mtimeMs });
      }
    } catch {}
    if (out.length > 2000) break;
  }
  return out;
}

function teamList() {
  return order.filter((id) => id !== LEAD).map((id) => `- ${id}: ${nameOf(id)} — ${agents[id].cfg.role}`).join('\n');
}

function resultsText(job, max = 3000) {
  if (!job.results.length) return '(아직 없음)';
  return job.results.map((r) => {
    const files = r.files.length ? `\n파일: ${r.files.map((f) => 'shared/' + f).join(', ')}` : '';
    return `### ${nameOf(r.agentId)} (${r.ok ? '완료' : '실패'})\n${r.text.slice(0, max)}${files}`;
  }).join('\n\n');
}

const TEXT_EXT = new Set(['.md', '.txt', '.html', '.htm', '.csv', '.json', '.svg', '.css', '.js', '.srt']);
function attachmentsText(list) {
  const L = ['## 이어서 할 자료 (대표님이 직접 고른 파일)', '아래 자료를 바탕으로 이어서 작업하세요. 파일은 ./shared/ 폴더에도 있습니다.', ''];
  let budget = 60000;
  for (const rel of list) {
    const meta = filesMeta[rel] || {};
    const by = meta.by === 'me' ? ' — 대표님이 올린 파일' : meta.by ? ` — 만든 사람: ${nameOf(meta.by)}` : '';
    const req = meta.request && meta.by !== 'me' ? ` (요청: "${meta.request}")` : '';
    L.push(`### shared/${rel}${by}${req}`);
    const abs = path.join(SHARED, rel);
    if (TEXT_EXT.has(path.extname(rel).toLowerCase()) && budget > 0) {
      try {
        let body = fs.readFileSync(abs, 'utf8');
        if (body.length > Math.min(20000, budget)) body = body.slice(0, Math.min(20000, budget)) + '\n…(길어서 뒷부분 생략, 전체는 파일에서 확인)';
        budget -= body.length;
        L.push('```', body, '```');
      } catch {}
    } else {
      let size = '';
      try { const b = fs.statSync(abs).size; size = b < 1024 * 1024 ? ` · ${Math.max(1, Math.round(b / 1024))}KB` : ` · ${(b / 1024 / 1024).toFixed(1)}MB`; } catch {}
      const k = kindOf(rel);
      if (k === 'image') L.push(`(이미지 레퍼런스${size}. 이미지 보기 도구로 shared/${rel} 를 직접 열어 색감·구도·분위기를 확인하고 반영하세요.)`);
      else if (k === 'video') {
        const infoPath = path.join(SHARED, `${rel}.analysis`, 'info.md');
        if (fs.existsSync(infoPath)) {
          L.push(`(영상 파일${size}. 영상은 직접 재생할 수 없으니, 아래 분석 자료와 장면 이미지를 열어 보고 판단하세요.)`, '');
          L.push(fs.readFileSync(infoPath, 'utf8').replace(/^# /, '#### ').replace(/\n## /g, '\n##### '));
        } else {
          L.push(`(영상 파일${size}. 직접 재생할 수 없고 분석 자료(ffmpeg)도 없어서, 파일 이름과 대표님 지시를 기준으로 작업하고 필요하면 확인 질문을 남기세요.)`);
        }
      }
      else if (k === 'audio') L.push(`(음악/나레이션 파일${size}. 직접 들을 수 없으면 파일 이름과 대표님 지시를 기준으로 작업하세요.)`);
      else if (rel.toLowerCase().endsWith('.pdf')) L.push(`(PDF 문서${size}. 파일을 직접 열어 읽으세요.)`);
      else L.push(`(파일${size}. 필요하면 직접 열어 보세요.)`);
    }
    L.push('');
  }
  return L.join('\n');
}

function buildTaskFile(a, task) {
  const job = jobs[task.jobId];
  const c = a.cfg;
  const L = [];
  L.push(`# 업무 지시서 ${task.id}`);
  L.push(`- 받는 사람: ${nameOf(c.id)} (${c.role})`);
  L.push(`- 보낸 사람: ${task.from === 'me' ? '대표님' : nameOf(task.from)}`);
  L.push(`- 시각: ${new Date().toLocaleString('ko-KR')}`);
  L.push('');
  if (task.kind === 'review') {
    L.push('## 대표님의 원래 요청', job.userText, '');
    if (job.attachments.length) L.push(`(대표님이 고른 자료: ${job.attachments.map((f) => 'shared/' + f).join(', ')})`, '');
    L.push(`## 지금까지 팀원 결과 (${job.round}번째 차례)`, resultsText(job), '');
    L.push('## 할 일');
    if (task.canDelegate) {
      L.push('팀원 결과를 검토하세요. 다음 단계가 필요하면 아래 <업무> 형식으로 다시 나누세요.');
      L.push('모든 일이 끝났으면 업무 블록 없이 대표님께 최종 보고만 쓰세요: 핵심 결론, 결과 파일 목록, 대표님이 결정할 것.');
    } else {
      L.push('이번이 마지막 차례입니다. 업무를 나누지 말고 대표님께 최종 보고만 쓰세요: 핵심 결론, 결과 파일 목록, 대표님이 결정할 것.');
    }
  } else {
    L.push('## 지시 내용', task.instruction, '');
    if (job.attachments.length) L.push(attachmentsText(job.attachments), '');
    if (task.kind === 'delegated') {
      L.push('## 참고: 대표님의 원래 요청', job.userText, '');
      const prev = job.results.filter((r) => r.agentId !== LEAD);
      if (prev.length) L.push('## 참고: 앞서 끝난 팀원 결과', resultsText({ results: prev }, 1500), '');
    }
  }
  if (task.canDelegate) {
    L.push('', '## 팀원 목록', teamList(), '');
    L.push('## 업무 나누는 법');
    L.push('파일을 찾아보거나 명령을 실행하지 말고, 이 지시서만 보고 바로 판단하세요. 큰 일은 직접 하지 말고 팀원에게 나누세요. 형식은 정확히 아래와 같습니다. 블록 밖의 글은 대표님께 보이는 보고입니다.');
    L.push('', '<업무 to="planner">', '구체적인 지시: 목표, 결과물 형태, 파일명, 완료 기준', '</업무>', '');
    L.push('- 한 번에 여러 개를 보낼 수 있습니다. 결과가 서로 필요한 일은 먼저 할 일만 보내세요. 결과가 오면 다음 차례에 다시 나눌 수 있습니다.');
    L.push('- 간단한 질문이나 인사에는 업무를 나누지 말고 바로 답하세요.');
  }
  L.push('', '## 작업 규칙');
  L.push('- 결과 파일은 반드시 ./output/ 폴더에 저장하세요. 파일명은 영어 소문자와 하이픈으로 (예: output/landing-plan.md).');
  L.push('- 다른 팀원의 결과물은 ./shared/ 폴더에 있습니다. 읽기만 하세요.');
  L.push('- 지금 폴더 밖(../ 등)은 열어보거나 명령을 실행하지 마세요. 권한이 막혀 있습니다. 필요한 정보는 이 지시서와 ./shared/ 에 다 있습니다.');
  L.push('- 마지막 답변은 한국어로, 대표님께 보고하듯 짧게: 한 일 / 만든 파일 / 확인이 필요한 것.');
  return L.join('\n');
}

function quoteWin(arg) {
  return /[\s"&|<>^(),;=]/.test(arg) ? `"${arg.replace(/"/g, '""')}"` : arg;
}

function startTask(a, task) {
  const id = a.cfg.id;
  a.current = task;
  task.startedAt = Date.now();
  a.log.push('', `━━━ 업무 시작: ${task.id} ━━━`);
  const taskFile = path.join(a.dir, 'inbox', `${task.id}.md`);
  fs.writeFileSync(taskFile, buildTaskFile(a, task));
  copyNewer(SHARED, path.join(a.dir, 'shared'));
  const outBefore = new Map(listFiles(path.join(a.dir, 'output')).map((f) => [f.path, f.mtime]));

  const resultFile = path.join(a.dir, 'done', `${task.id}.last.txt`);
  const prompt = `Read the task file inbox/${task.id}.md and complete it exactly as written. Follow your role file. Write your final answer in Korean.`;
  let cmd, args, parser, useShell = false, resultFromFile = false;
  if (MOCK) {
    cmd = process.execPath;
    args = [path.join(ROOT, 'mock-agent.js'), id, taskFile];
    parser = 'text';
  } else {
    const engineKey = task.engine || a.cfg.engine;
    const e = CFG.engines[engineKey];
    if (!e) return finishTask(a, task, outBefore, false, `엔진 설정을 찾을 수 없습니다: ${engineKey}`);
    cmd = e.cmd;
    args = e.args.map((x) => x.replace('{PROMPT}', prompt).replace('{RESULT_FILE}', resultFile));
    // 윈도우: Codex 보호 모드(sandbox) 방식을 지정. 기본 'unelevated' = 관리자 설정 없이 쓰는 방식 (보호는 유지).
    // 관리자 설정(codex sandbox setup)을 마쳤다면 settings.codexWindowsSandbox 를 'elevated' 로 바꿀 수 있음. '' 이면 지정 안 함.
    if (IS_WIN && engineKey === 'codex') {
      const mode = SET.codexWindowsSandbox ?? 'unelevated';
      if (mode) args = ['-c', `windows.sandbox=${mode}`, ...args];
    }
    // 직원별로 추가 허용할 도구 (예: 디자이너의 이미지 생성 MCP)
    const ai = args.indexOf('--allowedTools');
    if (ai >= 0 && (a.cfg.allowTools || []).length) args[ai + 1] += ',' + a.cfg.allowTools.join(',');
    args = args.concat(a.cfg.extraArgs || []);
    parser = e.parser;
    resultFromFile = !!e.resultFromFile;
    useShell = IS_WIN; // Windows에서는 claude/codex/gemini가 .cmd 파일이라 shell 필요
    if (useShell) args = args.map(quoteWin);
  }

  log(id, `▶ ${MOCK ? '연습 모드' : cmd} 실행 (폴더: agents/${id})`);
  let child;
  try {
    child = spawn(cmd, args, { cwd: a.dir, shell: useShell, env: process.env, windowsHide: true });
  } catch (err) {
    return finishTask(a, task, outBefore, false, `실행 실패: ${err.message}`);
  }
  task.child = child;
  child.stdin.end();
  let stdout = '', finalText = null, isError = false, buf = '', assistantText = '';

  const onLine = (line) => {
    if (parser === 'claude-stream') {
      let o;
      try { o = JSON.parse(line); } catch { return log(id, line); }
      if (o.type === 'assistant' && o.message?.content) {
        for (const c of o.message.content) {
          if (c.type === 'text' && c.text) { assistantText += c.text + '\n'; c.text.split('\n').forEach((l) => log(id, '💬 ' + l)); }
          if (c.type === 'tool_use') {
            const inp = c.input || {};
            const hint = inp.file_path || inp.path || inp.command || inp.pattern || inp.url || inp.query || inp.description || '';
            log(id, `🔧 ${c.name} ${String(hint).slice(0, 100)}`);
          }
        }
      } else if (o.type === 'result') {
        finalText = o.result ?? '';
        isError = !!o.is_error;
        for (const d of o.permission_denials || []) log(id, `🚫 허용되지 않은 작업이라 건너뜀: ${d.tool_name} ${JSON.stringify(d.tool_input || {}).slice(0, 100)}`);
      }
    } else {
      log(id, line);
    }
  };
  child.stdout.on('data', (d) => {
    const s = d.toString();
    stdout += s;
    buf += s;
    const lines = buf.split('\n');
    buf = lines.pop();
    lines.forEach(onLine);
  });
  child.stderr.on('data', (d) => d.toString().split('\n').forEach((l) => log(id, l)));

  const timeout = setTimeout(() => {
    task.timedOut = true;
    killTree(child);
  }, (SET.taskTimeoutMinutes || 30) * 60 * 1000);

  let done = false;
  const end = async (code, errMsg) => {
    if (done) return;
    done = true;
    clearTimeout(timeout);
    if (buf) onLine(buf);
    // 실패하면 대체 AI로 한 번 더 시도 (예: GPT 사용량이 다 찼을 때 Claude가 이어받기)
    const failed = errMsg || (!task.cancelled && !task.timedOut && (code !== 0 || isError));
    const usedEngine = task.engine || a.cfg.engine;
    const fb = (SET.fallback || {})[usedEngine];
    // 대체 AI가 설치·로그인돼 있을 때만 넘김 (예: Claude 무료 계정이면 넘기지 않음)
    const fbReady = failed && !MOCK && fb && !task.fallbackUsed && CFG.engines[fb] && engineAvail[fb] !== false && (await loggedIn(fb).catch(() => false)) !== false;
    if (fbReady) {
      task.fallbackUsed = true;
      task.engine = fb;
      log(id, `↪️ ${CFG.engines[usedEngine]?.label || usedEngine} 실패 → ${CFG.engines[fb].label}(으)로 다시 시도합니다`);
      addChat({ from: 'system', text: `${nameOf(id)}: ${CFG.engines[usedEngine]?.label || usedEngine}에서 오류가 나서 ${CFG.engines[fb].label}(으)로 이어서 합니다.` });
      a.current = null;
      try { fs.unlinkSync(taskFile); } catch {}
      startTask(a, task);
      return;
    }
    if (errMsg) return finishTask(a, task, outBefore, false, errMsg);
    if (task.cancelled) return finishTask(a, task, outBefore, false, '대표님 지시로 작업을 중지했습니다.');
    if (task.timedOut) return finishTask(a, task, outBefore, false, `시간 초과(${SET.taskTimeoutMinutes}분)로 중지했습니다.`);
    let text = finalText;
    if (text == null && resultFromFile && fs.existsSync(resultFile)) text = fs.readFileSync(resultFile, 'utf8');
    if (text == null) text = parser === 'claude-stream' ? assistantText : stdout;
    text = text.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').trim();
    const ok = code === 0 && !isError;
    if (!ok) {
      const tail = a.log.slice(-12).join('\n');
      text = `${text ? text + '\n\n' : ''}⚠️ 오류로 끝났습니다 (종료 코드 ${code}). 마지막 기록:\n${tail}`;
    }
    if (!text) text = '(답변 없이 끝났습니다)';
    finishTask(a, task, outBefore, ok, text);
  };
  child.on('error', (err) => {
    const hint = err.code === 'ENOENT' ? ` — '${cmd}' 프로그램을 찾을 수 없습니다. 설치와 로그인을 확인하세요 (README 참고).` : '';
    log(id, `❌ ${err.message}${hint}`);
    end(-1, `실행 실패: ${err.message}${hint}`);
  });
  child.on('close', (code) => end(code));
}

function killTree(child) {
  if (!child || child.exitCode !== null) return;
  if (IS_WIN) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
  else child.kill('SIGTERM');
}

const DELEG_RE = /<업무\s+to="([^"]+)"\s*>([\s\S]*?)<\/업무>/g;

function finishTask(a, task, outBefore, ok, text) {
  const id = a.cfg.id;
  const job = jobs[task.jobId];
  a.current = null;

  // 새로 생긴/바뀐 결과 파일 → shared 폴더로 복사
  const files = [];
  for (const f of listFiles(path.join(a.dir, 'output'))) try {
    if (outBefore.get(f.path) === f.mtime) continue;
    let dest = f.path;
    const srcAbs = path.join(a.dir, 'output', f.path);
    const exists = path.join(SHARED, dest);
    // 같은 이름 파일이 이미 있으면: 같은 업무 안에서 고친 거면 덮어쓰고, 다른 날·다른 업무 거면 이름 뒤에 -2, -3 을 붙여 둘 다 남김
    if (fs.existsSync(exists) && filesMeta[dest]?.jobId !== job.id) {
      const ext = path.extname(dest), stem = dest.slice(0, dest.length - ext.length);
      let n = 2;
      while (fs.existsSync(path.join(SHARED, `${stem}-${n}${ext}`)) && filesMeta[`${stem}-${n}${ext}`]?.jobId !== job.id) n++;
      dest = `${stem}-${n}${ext}`;
    }
    fs.mkdirSync(path.dirname(path.join(SHARED, dest)), { recursive: true });
    fs.copyFileSync(srcAbs, path.join(SHARED, dest));
    files.push(dest);
    filesMeta[dest] = { by: id, jobId: job.id, request: job.userText.slice(0, 100), time: Date.now() };
  } catch (e) { log(id, `⚠️ 결과 파일 복사 실패: ${f.path} (${e.message})`); }
  if (files.length) { saveMeta(); emit('files', filesWithMeta()); }

  // 업무 나누기 블록 해석
  const delegations = [];
  let shown = text;
  if (task.canDelegate) {
    shown = text.replace(DELEG_RE, (_, to, body) => {
      const target = resolveAgent(to.trim());
      if (target && target !== LEAD) {
        delegations.push({ target, body: body.trim() });
        return `📨 @${agents[target].cfg.name}에게 업무 전달: ${body.trim().split('\n')[0].slice(0, 80)}`;
      }
      return `⚠️ 알 수 없는 팀원(${to})에게 보낸 업무는 무시했습니다.`;
    });
  }
  shown = shown.trim();

  const taskPath = path.join(a.dir, 'inbox', `${task.id}.md`);
  try {
    fs.writeFileSync(path.join(a.dir, 'done', `${task.id}.result.md`), text);
    if (fs.existsSync(taskPath)) fs.renameSync(taskPath, path.join(a.dir, 'done', `${task.id}.md`));
  } catch {}

  log(id, ok ? `✅ 업무 완료 (${Math.round((Date.now() - task.startedAt) / 1000)}초)` : '⚠️ 업무 실패/중지');
  addChat({ from: id, text: shown.slice(0, 6000), files, ok, jobId: job.id, help: ok ? null : explainError(text + '\n' + a.log.slice(-30).join('\n')) });
  job.results.push({ agentId: id, text: shown, files, ok, kind: task.kind });
  if (task.kind === 'delegated') job.needsReview = true;
  for (const d of delegations) {
    if (agents[d.target].off) addChat({ from: 'system', text: `${nameOf(d.target)}은(는) 퇴근 상태라 업무가 대기 중이에요. 출근시키면 바로 시작합니다.` });
    enqueue(d.target, { kind: 'delegated', instruction: d.body, from: id, job, canDelegate: false });
  }

  job.open.delete(task.id);
  if (job.open.size === 0 && job.owner === LEAD && job.needsReview && !agents[LEAD].off) {
    job.needsReview = false;
    job.round += 1;
    enqueue(LEAD, { kind: 'review', instruction: '팀원 결과 검토', from: 'system', job, canDelegate: job.round < (SET.maxRounds || 4) });
  }
  pushAgent(id);
  pump();
}

// ---------- HTTP ----------
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.csv': 'text/plain; charset=utf-8',
  '.mov': 'video/quicktime', '.webm': 'video/webm', '.m4v': 'video/mp4', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
  '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.flac': 'audio/flac', '.srt': 'text/plain; charset=utf-8', '.vtt': 'text/plain; charset=utf-8',
};

// 대표님이 올릴 수 있는 파일 종류 (실행 파일 등은 막음)
const UPLOAD_KIND = {
  image: ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.heic', '.svg', '.bmp'],
  video: ['.mp4', '.mov', '.webm', '.m4v', '.avi', '.mkv'],
  audio: ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
  doc: ['.md', '.txt', '.pdf', '.csv', '.json', '.srt', '.vtt', '.html', '.docx', '.xlsx', '.pptx', '.hwp'],
};
const kindOf = (f) => Object.keys(UPLOAD_KIND).find((k) => UPLOAD_KIND[k].includes(path.extname(f).toLowerCase())) || null;
const MAX_UPLOAD = 2 * 1024 * 1024 * 1024; // 2GB

// ---------- 영상 분석 (ffmpeg): 장면 모음표 + 첫 3초 + 영상 정보 ----------
const run = (cmd, args, timeout = 120000) => new Promise((resolve) => {
  execFile(cmd, args, { timeout, windowsHide: true, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => resolve({ err, stdout: String(stdout || ''), stderr: String(stderr || '') }));
});
let HAS_FFMPEG = false; // 시작 준비 창에서 다시 확인할 수 있음
run('ffmpeg', ['-version'], 10000).then((r) => { HAS_FFMPEG = !r.err; if (!HAS_FFMPEG) console.log('ℹ️ ffmpeg 이 없어 영상 분석(장면 모음표)은 꺼져 있습니다. README 참고.'); });
const fmtTime = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}.${Math.floor((t % 1) * 10)}`;

async function analyzeVideo(abs, rel) {
  if (!HAS_FFMPEG) return null;
  const dirRel = `${rel}.analysis`;
  const dir = path.join(SHARED, dirRel);
  fs.mkdirSync(dir, { recursive: true });
  const probe = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate', '-of', 'json', abs], 30000);
  let info = {};
  try { info = JSON.parse(probe.stdout); } catch {}
  const v = (info.streams || []).find((x) => x.codec_type === 'video') || {};
  const hasAudio = (info.streams || []).some((x) => x.codec_type === 'audio');
  const dur = Number(info.format?.duration) || 0;
  if (!dur || !v.width) return null;
  const [fn, fd] = String(v.r_frame_rate || '0/1').split('/').map(Number);
  const fps = fd ? Math.round((fn / fd) * 100) / 100 : 0;
  const ratio = v.width > v.height ? '가로' : v.width < v.height ? '세로' : '정사각';
  // 전체 흐름: 최대 24장을 고르게 뽑아 한 장에 모음
  const count = Math.max(4, Math.min(24, Math.ceil(dur)));
  const step = dur / count;
  const cols = 6, rows = Math.ceil(count / cols);
  const sheet = await run('ffmpeg', ['-v', 'error', '-y', '-i', abs, '-vf', `fps=1/${step.toFixed(3)},scale=360:-2,tile=${cols}x${rows}:padding=10:margin=10:color=white`, '-frames:v', '1', '-q:v', '3', path.join(dir, 'scenes.jpg')]);
  // 후킹 분석: 첫 3초를 0.25초 간격으로 12장
  const hook = await run('ffmpeg', ['-v', 'error', '-y', '-t', '3', '-i', abs, '-vf', 'fps=4,scale=360:-2,tile=6x2:padding=10:margin=10:color=white', '-frames:v', '1', '-q:v', '3', path.join(dir, 'first-3s.jpg')]);
  const L = [
    `# 영상 분석 자료: ${path.basename(rel)}`,
    '',
    `- 길이: ${fmtTime(dur)} (${dur.toFixed(1)}초)`,
    `- 화면: ${v.width}x${v.height} (${ratio} 영상), ${fps}fps`,
    `- 소리: ${hasAudio ? '있음 (내용은 들을 수 없음. 필요하면 대표님께 대사·음악 설명을 요청)' : '없음'}`,
    '',
  ];
  if (!sheet.err) {
    L.push(`## 장면 모음표: \`shared/${dirRel}/scenes.jpg\``, `왼쪽 위부터 오른쪽으로, 줄 바꿔 아래로 시간 순서입니다. ${count}장, 약 ${step.toFixed(1)}초 간격.`);
    L.push(Array.from({ length: count }, (_, i) => `${i + 1}번=${fmtTime(i * step)}`).join(', '), '');
  }
  if (!hook.err) L.push(`## 첫 3초 (후킹 구간): \`shared/${dirRel}/first-3s.jpg\``, '0.25초 간격 12장. 1~6번 = 0~1.25초, 7~12번 = 1.5~2.75초.', '');
  L.push('## 분석할 때', '- 위 이미지 파일들을 이미지 보기 도구로 직접 열어서 보세요.', '- 컷 전환 속도, 구도·카메라 거리, 자막 위치·크기·색, 색감, 첫 3초에 무엇을 보여주는지를 확인할 수 있습니다.');
  fs.writeFileSync(path.join(dir, 'info.md'), L.join('\n'));
  const out = ['info.md', 'scenes.jpg', 'first-3s.jpg'].filter((f) => fs.existsSync(path.join(dir, f))).map((f) => `${dirRel}/${f}`);
  return out;
}

function safeJoin(base, rel) {
  let dec;
  try { dec = decodeURIComponent(rel); } catch { return null; }
  const p = path.normalize(path.join(base, dec));
  return p === base || p.startsWith(base + path.sep) ? p : null;
}

function serveFile(res, file) {
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}

function readBody(req) {
  return new Promise((resolve) => {
    let b = '';
    req.on('data', (d) => { b += d; if (b.length > 1e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(b || '{}')); } catch { resolve({}); } });
  });
}

const json = (res, obj, code = 200) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };

const LOCAL_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);
let updating = false;

const server = http.createServer(async (req, res) => {
  try { await handle(req, res); } catch (e) {
    console.error('요청 처리 오류:', e);
    if (!res.headersSent) json(res, { error: '서버 오류: ' + e.message }, 500); else res.end();
  }
});

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  // 보안: 다른 웹사이트가 내 AI 직원에게 몰래 지시하지 못하도록 막기
  if (!LOCAL_HOSTS.has(req.headers.host)) { res.writeHead(403); return res.end('forbidden'); }
  if (req.method !== 'GET') {
    const origin = req.headers.origin;
    if ((origin && !LOCAL_HOSTS.has(origin.replace(/^https?:\/\//, ''))) || req.headers['x-office'] !== '1') {
      res.writeHead(403); return res.end('forbidden');
    }
  }

  if (p === '/api/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': hi\n\n');
    clients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }
  if (p === '/api/state') {
    const bg = backgroundUrl();
    return json(res, {
      lead: LEAD, mock: MOCK, background: bg, ffmpeg: HAS_FFMPEG, engines: enginesInfo(), charTypes: CHAR_TYPES,
      agents: order.map(snapshot),
      logs: Object.fromEntries(order.map((id) => [id, agents[id].log.slice(-200)])),
      chat: chat.slice(-200),
      files: filesWithMeta(),
    });
  }
  if (p === '/api/message' && req.method === 'POST') {
    const body = await readBody(req);
    let text = String(body.text || '').trim();
    let to = body.to && agents[body.to] ? body.to : LEAD;
    const m = text.match(/^@(\S+)\s*([\s\S]*)$/);
    if (m && resolveAgent(m[1])) { to = resolveAgent(m[1]); text = m[2].trim(); }
    if (!text) return json(res, { error: '내용이 비어 있습니다' }, 400);
    const attachments = (Array.isArray(body.attachments) ? body.attachments : []).slice(0, 30).map(String)
      .filter((f) => { const abs = safeJoin(SHARED, encodeURIComponent(f)); return abs && fs.existsSync(abs) && fs.statSync(abs).isFile(); });
    addChat({ from: 'me', to, text, files: attachments });
    createJob(to, text, attachments);
    return json(res, { ok: true, to });
  }
  // 대표님 파일 올리기 (채팅에 끌어다 놓기) → shared/uploads/날짜/파일명
  if (p === '/api/upload' && req.method === 'POST') {
    let name = '';
    try { name = decodeURIComponent(String(req.headers['x-file-name'] || '')); } catch {}
    name = path.basename(name).replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').replace(/^\.+/, '').trim().slice(-100);
    if (!name || !kindOf(name)) return json(res, { error: '이미지, 영상, 음악·나레이션, 문서(md·txt·pdf 등)만 올릴 수 있어요' }, 400);
    const len = Number(req.headers['content-length'] || 0);
    if (len > MAX_UPLOAD) return json(res, { error: '2GB 이하 파일만 올릴 수 있어요' }, 400);
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dir = path.join(SHARED, 'uploads', day);
    fs.mkdirSync(dir, { recursive: true });
    const ext = path.extname(name), stem = name.slice(0, name.length - ext.length);
    let fname = name, n = 2;
    while (fs.existsSync(path.join(dir, fname))) fname = `${stem}-${n++}${ext}`;
    const abs = path.join(dir, fname);
    await new Promise((resolve, reject) => {
      const out = fs.createWriteStream(abs);
      let size = 0;
      req.on('data', (c) => { size += c.length; if (size > MAX_UPLOAD) { req.destroy(); out.destroy(); reject(new Error('too big')); } });
      req.pipe(out);
      out.on('finish', resolve);
      out.on('error', reject);
      req.on('error', reject);
    }).catch((e) => { try { fs.unlinkSync(abs); } catch {} throw e; });
    const rel = `uploads/${day}/${fname}`;
    filesMeta[rel] = { by: 'me', jobId: `upload-${day}`, request: `대표님이 올린 파일 (${day})`, time: Date.now() };
    let analysis = null;
    if (kindOf(rel) === 'video') {
      analysis = await analyzeVideo(abs, rel).catch(() => null);
      for (const f of analysis || []) filesMeta[f] = { by: 'me', jobId: `upload-${day}`, request: `대표님이 올린 파일 (${day})`, time: Date.now() };
    }
    saveMeta();
    emit('files', filesWithMeta());
    return json(res, { ok: true, path: rel, kind: kindOf(rel), analyzed: !!(analysis && analysis.length), ffmpeg: HAS_FFMPEG });
  }
  // 사무실 배경 바꾸기: 결과물/올린 이미지 → 배경, DELETE → 기본 배경
  if (p === '/api/background' && (req.method === 'POST' || req.method === 'DELETE')) {
    if (req.method === 'POST') {
      const body = await readBody(req);
      const rel = String(body.path || '');
      const abs = safeJoin(SHARED, encodeURIComponent(rel));
      const ext = path.extname(rel).slice(1).toLowerCase();
      if (!abs || !fs.existsSync(abs) || !BG_EXT.includes(ext)) return json(res, { error: 'png, jpg, webp 이미지만 배경으로 쓸 수 있어요' }, 400);
      clearBackground();
      fs.copyFileSync(abs, path.join(PUBLIC, `office-bg.${ext}`));
      addChat({ from: 'system', text: `사무실 배경을 바꿨어요 🏠 (${rel})` });
    } else clearBackground();
    emit('background', { url: backgroundUrl() });
    return json(res, { ok: true });
  }
  // 디자이너에게 배경 디자인 맡기기 (지금 화면 + 캐릭터 이미지를 레퍼런스로 첨부)
  if (p === '/api/background/design' && req.method === 'POST') {
    const body = await readBody(req);
    const designer = order.find((id) => id === 'designer') || order.find((id) => /디자인/.test(agents[id].cfg.name));
    if (!designer) return json(res, { error: '디자이너 직원이 없어요' }, 400);
    const atts = [];
    const snap = String(body.snapshot || '');
    if (snap && fs.existsSync(path.join(SHARED, snap))) atts.push(snap);
    const refDir = path.join(SHARED, 'uploads', 'refs');
    fs.mkdirSync(refDir, { recursive: true });
    for (const id of order) {
      const img = imageFor(id, '');
      if (!img) continue;
      const src = path.join(PUBLIC, img.split('?')[0]);
      const rel = `uploads/refs/character-${id}${path.extname(src)}`;
      fs.copyFileSync(src, path.join(SHARED, rel));
      filesMeta[rel] = { by: 'me', jobId: 'refs', request: '캐릭터 레퍼런스', time: Date.now() };
      atts.push(rel);
    }
    saveMeta();
    const text = backgroundBrief();
    addChat({ from: 'me', to: designer, text: '🎨 사무실 배경 새로 디자인해줘 (지금 화면 + 캐릭터 이미지 레퍼런스 첨부)', files: atts });
    createJob(designer, text, atts);
    return json(res, { ok: true });
  }
  // 캐릭터 이미지 바꾸기 (화면에 끌어다 놓기)
  const im = p.match(/^\/api\/agent\/([a-z0-9_-]+)\/image$/);
  if (im && agents[im[1]] && (req.method === 'POST' || req.method === 'DELETE')) {
    const suffix = url.searchParams.get('work') === '1' ? '-work' : '';
    const dir = path.join(PUBLIC, 'characters');
    fs.mkdirSync(dir, { recursive: true });
    for (const e of ['png', 'webp', 'gif', 'jpg', 'jpeg']) fs.rmSync(path.join(dir, `${im[1]}${suffix}.${e}`), { force: true });
    if (req.method === 'POST') {
      const ext = { 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/jpeg': 'jpg' }[req.headers['content-type']];
      if (!ext) return json(res, { error: 'png, webp, gif, jpg 이미지만 됩니다' }, 400);
      const chunks = [];
      let size = 0;
      for await (const c of req) { size += c.length; if (size > 15e6) return json(res, { error: '15MB 이하만 됩니다' }, 400); chunks.push(c); }
      fs.writeFileSync(path.join(dir, `${im[1]}${suffix}.${ext}`), Buffer.concat(chunks));
    }
    pushAgent(im[1]);
    return json(res, { ok: true });
  }
  // ---------- 시작 준비 (설치·로그인 점검) ----------
  if (p === '/api/setup' && req.method === 'GET') return json(res, await setupStatus());
  if (p === '/api/setup/install' && req.method === 'POST') {
    const body = await readBody(req);
    return json(res, await runSetupTask('install', String(body.what || '')));
  }
  if (p === '/api/setup/login' && req.method === 'POST') {
    const body = await readBody(req);
    return json(res, await runSetupTask('login', String(body.what || '')));
  }
  if (p === '/api/setup/input' && req.method === 'POST') {
    const body = await readBody(req);
    if (setupProc && setupProc.stdin.writable) { setupProc.stdin.write(String(body.text || '') + '\n'); return json(res, { ok: true }); }
    return json(res, { error: '진행 중인 로그인이 없어요' }, 400);
  }
  if (p === '/api/setup/cancel' && req.method === 'POST') {
    if (setupProc) { killTree(setupProc); setupProc = null; }
    return json(res, { ok: true });
  }
  // 직원 추가
  if (p === '/api/agents' && req.method === 'POST') {
    const body = await readBody(req);
    const clean = (v, n) => String(v || '').replace(/[<>"'`@\\/{}\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
    const name = clean(body.name, 10), nick = clean(body.nickname, 12), role = clean(body.role, 80);
    const details = String(body.details || '').slice(0, 3000).trim();
    const engine = CFG.engines[body.engine] ? body.engine : 'codex';
    if (!name || !nick || !role) return json(res, { error: '직군, 이름, 하는 일을 모두 적어 주세요' }, 400);
    if (order.length >= 12) return json(res, { error: '직원은 12명까지 둘 수 있어요' }, 400);
    if (order.some((x) => agents[x].cfg.nickname === nick)) return json(res, { error: `'${nick}'은(는) 이미 있는 이름이에요` }, 400);
    const id = 'staff-' + Date.now().toString(36);
    const type = CHAR_TYPES.includes(body.type) ? body.type : CHAR_TYPES[order.length % CHAR_TYPES.length];
    const palette = [['#ffffff', '#ffb3c7'], ['#f3dcc0', '#ff9fb2'], ['#fff7ec', '#ffb08a'], ['#fff1a8', '#ffb3a0'], ['#e8f4ff', '#9fd0ff'], ['#f0ffe9', '#9fe0a8']];
    const [color, accent] = palette[order.length % palette.length];
    const cfg = { id, name, nickname: nick, engine, role, prop: clean(body.prop, 4) || '⭐', character: { type, color, accent }, custom: true, allowTools: [], extraArgs: [] };
    const dir = path.join(AGENTS_DIR, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'role.local.md'), ROLE_TEMPLATE(name, role, details));
    try { updateLocalAgent(id, cfg); } catch (e) { return json(res, { error: e.message }, 500); }
    setupAgent(cfg);
    addChat({ from: 'system', text: `새 직원 ${name} ${nick} 입사! 🎉 (${CFG.engines[engine].label})` });
    emit('roster', {});
    return json(res, { ok: true, id });
  }
  // 직원 삭제 (비서는 삭제 불가)
  const dm = p.match(/^\/api\/agents\/([a-z0-9_-]+)$/);
  if (dm && req.method === 'DELETE') {
    const id = dm[1], a = agents[id];
    if (!a) return json(res, { error: '없는 직원이에요' }, 404);
    if (id === LEAD) return json(res, { error: '비서(팀 리더)는 삭제할 수 없어요. AI나 이름은 바꿀 수 있어요' }, 400);
    if (a.current) return json(res, { error: '일하는 중이에요. 끝나거나 중지한 뒤에 삭제해 주세요' }, 400);
    for (const t of a.queue) jobs[t.jobId]?.open.delete(t.id);
    const label = nameOf(id);
    try { updateLocalAgent(id, a.cfg.custom ? null : { removed: true }); } catch (e) { return json(res, { error: e.message }, 500); }
    delete agents[id];
    order.splice(order.indexOf(id), 1);
    addChat({ from: 'system', text: `${label} 퇴사했어요 👋 (작업 폴더와 결과물은 그대로 남아 있어요)` });
    emit('roster', {});
    return json(res, { ok: true });
  }
  // 직원이 쓰는 AI 바꾸기
  const em = p.match(/^\/api\/agent\/([a-z0-9_-]+)\/engine$/);
  if (em && agents[em[1]] && req.method === 'POST') {
    const body = await readBody(req);
    const key = String(body.engine || '');
    if (!CFG.engines[key]) return json(res, { error: '알 수 없는 AI예요' }, 400);
    const a = agents[em[1]];
    if (a.cfg.engine === key) return json(res, { ok: true });
    try { updateLocalAgent(em[1], { engine: key }); } catch (e) { return json(res, { error: e.message }, 500); }
    a.cfg.engine = key;
    addChat({ from: 'system', text: `${nameOf(em[1])}의 AI를 ${CFG.engines[key].label}(으)로 바꿨어요${a.current ? ' (지금 하는 일이 끝난 뒤부터 적용)' : ''}` });
    pushAgent(em[1]);
    return json(res, { ok: true });
  }
  if (p === '/api/agents/engine-all' && req.method === 'POST') {
    const body = await readBody(req);
    const key = String(body.engine || '');
    if (!CFG.engines[key]) return json(res, { error: '알 수 없는 AI예요' }, 400);
    try { for (const id of order) { updateLocalAgent(id, { engine: key }); agents[id].cfg.engine = key; pushAgent(id); } } catch (e) { return json(res, { error: e.message }, 500); }
    addChat({ from: 'system', text: `모든 직원의 AI를 ${CFG.engines[key].label}(으)로 바꿨어요` });
    return json(res, { ok: true });
  }
  if (p === '/api/engines' && req.method === 'POST') {
    await Promise.all(Object.keys(CFG.engines).map(checkEngine));
    return json(res, { engines: enginesInfo() });
  }
  // 직원 이름(별명) 바꾸기 — agents.local.json 에 저장되어 업데이트해도 유지됨
  const nm = p.match(/^\/api\/agent\/([a-z0-9_-]+)\/nickname$/);
  if (nm && agents[nm[1]] && req.method === 'POST') {
    const body = await readBody(req);
    const nick = String(body.nickname || '').replace(/[<>"'`@\\/{}\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 12);
    if (!nick) return json(res, { error: '이름을 입력해 주세요' }, 400);
    const clash = order.find((x) => x !== nm[1] && (agents[x].cfg.nickname === nick || agents[x].cfg.name === nick));
    if (clash) return json(res, { error: `'${nick}'은(는) 이미 다른 직원 이름이에요` }, 400);
    const localPath = path.join(ROOT, 'agents.local.json');
    let local = {};
    try { local = JSON.parse(fs.readFileSync(localPath, 'utf8')); } catch (e) {
      if (e.code !== 'ENOENT') return json(res, { error: 'agents.local.json 파일 형식이 잘못돼 저장하지 못했어요' }, 500);
    }
    local.agents = Array.isArray(local.agents) ? local.agents : [];
    let entry = local.agents.find((x) => x.id === nm[1]);
    if (!entry) { entry = { id: nm[1] }; local.agents.push(entry); }
    entry.nickname = nick;
    fs.writeFileSync(localPath, JSON.stringify(local, null, 2));
    const before = nameOf(nm[1]);
    agents[nm[1]].cfg.nickname = nick;
    addChat({ from: 'system', text: `${before} → ${nameOf(nm[1])} 로 이름을 바꿨어요 ✏️` });
    pushAgent(nm[1]);
    return json(res, { ok: true });
  }
  const am = p.match(/^\/api\/agent\/([a-z0-9_-]+)\/(toggle|stop|clear)$/);
  if (am && req.method === 'POST') {
    const a = agents[am[1]];
    if (!a) return json(res, { error: 'no agent' }, 404);
    if (am[2] === 'toggle') {
      a.off = !a.off;
      addChat({ from: 'system', text: `${nameOf(a.cfg.id)} ${a.off ? '퇴근했습니다 🌙' : '출근했습니다 ☀️'}` });
    }
    if (am[2] === 'stop' && a.current) { a.current.cancelled = true; killTree(a.current.child); }
    if (am[2] === 'clear') {
      for (const t of a.queue) jobs[t.jobId]?.open.delete(t.id);
      a.queue = [];
    }
    pushAgent(a.cfg.id);
    pump();
    return json(res, { ok: true });
  }
  if (p === '/api/all' && req.method === 'POST') {
    const body = await readBody(req);
    const off = !!body.off;
    order.forEach((id) => { agents[id].off = off; });
    addChat({ from: 'system', text: off ? '전체 퇴근! 수고했어요 🌙' : '전체 출근! 좋은 아침 ☀️' });
    pump();
    return json(res, { ok: true });
  }
  if (p === '/api/version') {
    let latest = null;
    try {
      const r = await fetch(`${REPO_RAW}/VERSION`, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
      if (r.ok) latest = (await r.text()).trim();
    } catch {}
    return json(res, { current: VERSION, latest, canUpdate: fs.existsSync(path.join(ROOT, IS_WIN ? 'install-win.ps1' : 'install-mac.sh')) });
  }
  if (p === '/api/update' && req.method === 'POST') {
    if (updating) return json(res, { error: '이미 업데이트 중입니다' }, 409);
    if (order.some((id) => agents[id].current)) return json(res, { error: '일하는 직원이 있어요. 끝난 뒤에 업데이트해 주세요' }, 409);
    updating = true;
    const env = { ...process.env, AI_OFFICE_UPDATE: '1', AI_OFFICE_DIR: ROOT };
    // 윈도우: 한글이 깨지지 않도록 UTF-8로 읽어서 실행
    const ps = `$s=[IO.File]::ReadAllText('${path.join(ROOT, 'install-win.ps1').replace(/'/g, "''")}',[Text.Encoding]::UTF8); Invoke-Expression $s`;
    const child = IS_WIN
      ? spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { cwd: ROOT, env, windowsHide: true })
      : spawn('bash', [path.join(ROOT, 'install-mac.sh'), '--update'], { cwd: ROOT, env });
    let out = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('close', (code) => {
      updating = false;
      if (code !== 0) return json(res, { error: '업데이트 실패:\n' + out.slice(-800) }, 500);
      json(res, { ok: true });
      addChat({ from: 'system', text: '새 버전으로 업데이트했어요. 사무실을 다시 여는 중... 🔄' });
      setTimeout(() => process.exit(42), 500); // 42 = 실행 파일이 자동으로 다시 켜도록 하는 신호
    });
    return;
  }
  if (p.startsWith('/files/')) {
    // 직원이 만든 HTML 파일은 격리해서 보여줌 (사무실 기능에 접근 못 하게)
    res.setHeader('Content-Security-Policy', 'sandbox allow-scripts allow-popups allow-forms');
    return serveFile(res, safeJoin(SHARED, p.slice(7)));
  }
  if (p === '/') return serveFile(res, path.join(PUBLIC, 'index.html'));
  return serveFile(res, safeJoin(PUBLIC, p.slice(1)));
}

function openBrowser() {
  const url = `http://localhost:${PORT}`;
  try {
    if (process.platform === 'darwin') spawn('open', [url]);
    else if (IS_WIN) spawn('cmd', ['/c', 'start', '', url], { windowsHide: true });
  } catch {}
}

// ---------- 시작 준비: 설치 여부·로그인 여부 확인, 버튼으로 설치·로그인 ----------
const runQuiet = (cmd, args, timeout = 20000) => new Promise((resolve) => {
  let out = '', done = false;
  const finish = (code) => { if (!done) { done = true; resolve({ code, out }); } };
  try {
    const c = spawn(cmd, args, { shell: IS_WIN, windowsHide: true, env: process.env });
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { out += d; });
    c.on('error', () => finish(-1));
    c.on('close', (code) => finish(code));
    setTimeout(() => { try { c.kill(); } catch {} finish(-2); }, timeout);
  } catch { finish(-1); }
});
async function loggedIn(key) {
  if (MOCK) return true;
  if (key === 'claude') {
    const r = await runQuiet('claude', ['auth', 'status', '--json']);
    try { return !!JSON.parse(r.out.slice(r.out.indexOf('{'))).loggedIn; } catch { return r.code === 0 && !/not logged in/i.test(r.out); }
  }
  if (key === 'codex') { const r = await runQuiet('codex', ['login', 'status']); return r.code === 0 && !/not logged in/i.test(r.out); }
  return null;
}
async function setupStatus() {
  const used = new Set(order.map((id) => agents[id].cfg.engine));
  const keys = Object.keys(CFG.engines).filter((k) => k !== 'gemini' || used.has('gemini'));
  const engines = [];
  for (const key of keys) {
    const installed = MOCK ? true : await checkEngine(key);
    engines.push({ key, label: CFG.engines[key].label, installed, loggedIn: installed ? await loggedIn(key) : false, needed: used.has(key), backup: !used.has(key) && [...used].some((u) => (SET.fallback || {})[u] === key) });
  }
  const ff = await runQuiet('ffmpeg', ['-version'], 10000);
  HAS_FFMPEG = ff.code === 0;
  const git = IS_WIN ? (fs.existsSync(PORTABLE_BASH) || (await runQuiet('git', ['--version'], 10000)).code === 0) : true;
  return { platform: process.platform, engines, ffmpeg: HAS_FFMPEG, git, busy: setupBusy };
}
let setupProc = null, setupBusy = null;
function setupCommand(kind, what) {
  if (kind === 'login') {
    if (what === 'claude') return ['claude', ['auth', 'login', '--claudeai']];
    if (what === 'codex') return ['codex', ['login']];
  }
  if (kind === 'install') {
    if (what === 'claude') return IS_WIN
      ? ['powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', 'irm https://claude.ai/install.ps1 | iex']]
      : ['bash', ['-c', 'curl -fsSL https://claude.ai/install.sh | bash']];
    if (what === 'codex') return ['npm', ['install', '-g', '--prefix', NPM_PREFIX, '@openai/codex@latest']];
    if (what === 'ffmpeg') return IS_WIN
      ? ['winget', ['install', '-e', '--id', 'Gyan.FFmpeg', '--accept-package-agreements', '--accept-source-agreements']]
      : ['brew', ['install', 'ffmpeg']];
    if (what === 'git' && IS_WIN) return ['powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(ROOT, 'win-git.ps1'), '-Dest', ROOT]];
  }
  return null;
}
function runSetupTask(kind, what) {
  return new Promise((resolve) => {
    if (setupBusy) return resolve({ error: '다른 설치·로그인이 진행 중이에요. 끝난 뒤에 눌러 주세요' });
    const c = setupCommand(kind, what);
    if (!c) return resolve({ error: '알 수 없는 항목이에요' });
    setupBusy = `${kind}:${what}`;
    const label = { claude: 'Claude Code', codex: 'Codex (GPT)', ffmpeg: 'ffmpeg', git: 'Git' }[what] || what;
    const say = (line) => emit('setup-log', { line: String(line).replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '') });
    say(`▶ ${label} ${kind === 'login' ? '로그인' : '설치'} 시작`);
    let out = '';
    const urls = new Set();
    let proc;
    try {
      proc = spawn(c[0], c[1].map((x) => (IS_WIN && /\s/.test(x) && c[0] !== 'powershell' ? `"${x}"` : x)), { shell: IS_WIN && c[0] !== 'powershell', windowsHide: true, env: { ...process.env, BROWSER: process.env.BROWSER || '' } });
    } catch (e) { setupBusy = null; return resolve({ error: e.message, help: explainError(e.message) }); }
    setupProc = proc;
    const onData = (d) => {
      const sline = d.toString();
      out += sline;
      sline.split(/\r?\n/).forEach((l) => { if (l.trim()) say(l); });
      for (const u of sline.match(/https?:\/\/[^\s"'<>]+/g) || []) if (!urls.has(u)) { urls.add(u); emit('setup-url', { url: u }); }
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    const timer = setTimeout(() => killTree(proc), (kind === 'login' ? 10 : 20) * 60 * 1000);
    const end = async (code, errMsg) => {
      clearTimeout(timer);
      setupProc = null;
      setupBusy = null;
      if (kind === 'install') {
        if (what === 'git' && fs.existsSync(PORTABLE_BASH)) process.env.CLAUDE_CODE_GIT_BASH_PATH = PORTABLE_BASH;
        await checkEngine(what).catch(() => {});
        if (what === 'ffmpeg') HAS_FFMPEG = (await runQuiet('ffmpeg', ['-version'], 10000)).code === 0;
      }
      const ok = !errMsg && code === 0;
      say(ok ? `✅ ${label} ${kind === 'login' ? '로그인' : '설치'} 완료` : `⚠️ ${label} ${kind === 'login' ? '로그인' : '설치'}이(가) 끝나지 않았어요`);
      emit('setup-done', { ok });
      let help = ok ? null : explainError((errMsg || '') + '\n' + out);
      if (!ok && !help && what === 'ffmpeg' && !IS_WIN && /brew/.test(errMsg || out)) help = { title: 'Homebrew가 없어요', fix: '맥에서는 https://brew.sh 의 안내대로 Homebrew를 설치한 뒤 다시 눌러 주세요. ffmpeg은 선택 사항이라 없어도 사무실은 쓸 수 있어요.', action: null };
      resolve(ok ? { ok: true } : { error: `${label} ${kind === 'login' ? '로그인' : '설치'}이(가) 끝나지 않았어요`, help });
    };
    proc.on('error', (e) => end(-1, e.code === 'ENOENT' ? `${c[0]} 프로그램을 찾을 수 없음 (ENOENT)` : e.message));
    proc.on('close', (code) => end(code));
  });
}

// ---------- 사무실 배경 ----------
const BG_EXT = ['png', 'jpg', 'jpeg', 'webp'];
function backgroundUrl() {
  const f = BG_EXT.map((e) => `office-bg.${e}`).find((x) => fs.existsSync(path.join(PUBLIC, x)));
  return f ? `${f}?v=${Math.round(fs.statSync(path.join(PUBLIC, f)).mtimeMs)}` : null;
}
function clearBackground() { for (const e of BG_EXT) fs.rmSync(path.join(PUBLIC, `office-bg.${e}`), { force: true }); }

function backgroundBrief() {
  return `사무실 대시보드의 **방 배경 그림**을 새로 디자인해 주세요.

## 사용처 (중요)
- 이 그림은 웹 화면 "AI 오피스"의 사무실 배경으로 깔립니다. 그 위에 코드로 **캐릭터, 책상 6개, 소파, 러그, 커피바, 빈백, 스탠드**가 올라갑니다.
- 그래서 배경에는 **가구와 캐릭터를 그리지 마세요.** 벽, 바닥, 창문, 벽 장식(가랜드, 액자, 선반, 시계 등), 바닥 질감, 모서리 소품 정도만 그립니다.
- 글자는 넣지 마세요.

## 크기와 배치
- 가로형 **3:2 비율** (1536x1024 권장). 꽉 채워서, 여백 없이.
- 위쪽 약 17% = 벽, 나머지 = 바닥. 정면에서 살짝 위에서 내려다본 평면 시점(플랫 일러스트). 원근감은 약하게.
- 왼쪽 1/3 = 라운지(소파·러그 자리), 오른쪽 2/3 = 책상 6개(3열 x 2줄) 자리. 이 영역은 **바닥만 깨끗하게** 비워 두세요.
- 첨부한 office-current-layout.png 가 지금 화면입니다. 배치는 이걸 기준으로 하고, 방 분위기만 훨씬 예쁘게 바꿔 주세요.

## 스타일
- 첨부한 캐릭터 이미지들과 잘 어울리게: 부드러운 파스텔(핑크·크림·민트·하늘), 둥글고 굵은 갈색 외곽선, 귀여운 손그림 그림책 느낌, 그림자는 아주 약하게.
- 캐릭터 이미지는 **분위기 참고용**입니다. 캐릭터 자체를 그리지 마세요.
- 이미지 프롬프트 예시(영어): "flat cute pastel illustration of an empty cozy office room interior, front view slightly from above, pink wall with string lights and big windows on the top 17 percent, light wooden floor, no furniture, no people, no text, soft brown rounded outlines, storybook kawaii style, 3:2 landscape"

## 결과물
- 시안 2개: output/office-bg-a.png, output/office-bg-b.png
- 각 시안 의도를 한 줄씩 보고해 주세요. 대표님이 미리보기에서 "사무실 배경으로 쓰기"를 눌러 바로 적용합니다.`;
}

// 예상 못 한 오류가 나도 사무실 전체가 꺼지지 않게
process.on('uncaughtException', (e) => console.error('⚠️ 오류 (계속 실행 중):', e));
process.on('unhandledRejection', (e) => console.error('⚠️ 오류 (계속 실행 중):', e));

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`\n🏢 AI 오피스가 이미 켜져 있어요 → http://localhost:${PORT}`);
    openBrowser();
    setTimeout(() => process.exit(0), 300);
  }
  throw e;
});

// 내 컴퓨터에서만 접속 가능 (127.0.0.1). 직원들이 파일을 만들 수 있으므로 외부에 열지 않습니다.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🏢 AI 오피스 출근 완료! 브라우저에서 여세요 → http://localhost:${PORT}`);
  if (MOCK) console.log('   (연습 모드: 실제 AI 대신 가짜 직원이 일합니다)');
  console.log('   종료: 이 창에서 Ctrl + C\n');
  if (process.env.OFFICE_OPEN === '1') openBrowser();
});
