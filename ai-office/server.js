// AI 오피스 서버 — 외부 패키지 없이 Node.js만으로 동작합니다.
// 직원(에이전트) 한 명 = 터미널 AI 프로그램(claude / codex / gemini) 한 개.
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = __dirname;
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, 'agents.json'), 'utf8'));
const SET = CFG.settings;
const MOCK = process.env.OFFICE_MOCK === '1' || process.argv.includes('--mock');
const PORT = Number(process.env.PORT) || SET.port || 3939;
const IS_WIN = process.platform === 'win32';

const AGENTS_DIR = path.join(ROOT, 'agents');
const SHARED = path.join(ROOT, 'shared');
const DATA = path.join(ROOT, 'data');
const PUBLIC = path.join(ROOT, 'public');
const LEAD = SET.leadAgent;

for (const d of [SHARED, DATA]) fs.mkdirSync(d, { recursive: true });

// ---------- 상태 ----------
const agents = {}; // id -> { cfg, dir, off, current, queue, lastLine, log }
const order = [];
for (const a of CFG.agents) {
  const dir = path.join(AGENTS_DIR, a.id);
  for (const sub of ['inbox', 'done', 'output', 'shared']) fs.mkdirSync(path.join(dir, sub), { recursive: true });
  // role.md(원본) → 엔진별 설명서 파일(CLAUDE.md / AGENTS.md / GEMINI.md)로 복사
  const rolePath = path.join(dir, 'role.md');
  const engine = CFG.engines[a.engine];
  if (fs.existsSync(rolePath) && engine?.roleFile) fs.copyFileSync(rolePath, path.join(dir, engine.roleFile));
  agents[a.id] = { cfg: a, dir, off: false, current: null, queue: [], lastLine: '', log: [] };
  order.push(a.id);
}

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
    if (fs.existsSync(path.join(PUBLIC, f))) return f;
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
    current: a.current ? { instruction: a.current.instruction.slice(0, 120), startedAt: a.current.startedAt } : null,
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

function createJob(to, text) {
  const job = { id: newId('job'), owner: to, round: 1, open: new Set(), results: [], userText: text, needsReview: false };
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

function copyNewer(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyNewer(s, d);
    else if (!fs.existsSync(d) || fs.statSync(s).mtimeMs > fs.statSync(d).mtimeMs) fs.copyFileSync(s, d);
  }
}

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(listFiles(p, base));
    else {
      const st = fs.statSync(p);
      out.push({ path: path.relative(base, p).split(path.sep).join('/'), size: st.size, mtime: st.mtimeMs });
    }
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
    if (task.kind === 'delegated') {
      L.push('## 참고: 대표님의 원래 요청', job.userText, '');
      const prev = job.results.filter((r) => r.agentId !== LEAD);
      if (prev.length) L.push('## 참고: 앞서 끝난 팀원 결과', resultsText({ results: prev }, 1500), '');
    }
  }
  if (task.canDelegate) {
    L.push('', '## 팀원 목록', teamList(), '');
    L.push('## 업무 나누는 법');
    L.push('큰 일은 직접 하지 말고 팀원에게 나누세요. 형식은 정확히 아래와 같습니다. 블록 밖의 글은 대표님께 보이는 보고입니다.');
    L.push('', '<업무 to="planner">', '구체적인 지시: 목표, 결과물 형태, 파일명, 완료 기준', '</업무>', '');
    L.push('- 한 번에 여러 개를 보낼 수 있습니다. 결과가 서로 필요한 일은 먼저 할 일만 보내세요. 결과가 오면 다음 차례에 다시 나눌 수 있습니다.');
    L.push('- 간단한 질문이나 인사에는 업무를 나누지 말고 바로 답하세요.');
  }
  L.push('', '## 작업 규칙');
  L.push('- 결과 파일은 반드시 ./output/ 폴더에 저장하세요. 파일명은 영어 소문자와 하이픈으로 (예: output/landing-plan.md).');
  L.push('- 다른 팀원의 결과물은 ./shared/ 폴더에 있습니다. 읽기만 하세요.');
  L.push('- 마지막 답변은 한국어로, 대표님께 보고하듯 짧게: 한 일 / 만든 파일 / 확인이 필요한 것.');
  return L.join('\n');
}

function quoteWin(arg) {
  return /[\s"&|<>^]/.test(arg) ? `"${arg.replace(/"/g, '""')}"` : arg;
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
    const e = CFG.engines[a.cfg.engine];
    if (!e) return finishTask(a, task, outBefore, false, `엔진 설정을 찾을 수 없습니다: ${a.cfg.engine}`);
    cmd = e.cmd;
    args = e.args.map((x) => x.replace('{PROMPT}', prompt).replace('{RESULT_FILE}', resultFile)).concat(a.cfg.extraArgs || []);
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
  let stdout = '', finalText = null, isError = false, buf = '';

  const onLine = (line) => {
    if (parser === 'claude-stream') {
      let o;
      try { o = JSON.parse(line); } catch { return log(id, line); }
      if (o.type === 'assistant' && o.message?.content) {
        for (const c of o.message.content) {
          if (c.type === 'text' && c.text) c.text.split('\n').forEach((l) => log(id, '💬 ' + l));
          if (c.type === 'tool_use') {
            const inp = c.input || {};
            const hint = inp.file_path || inp.path || inp.command || inp.pattern || inp.url || inp.query || inp.description || '';
            log(id, `🔧 ${c.name} ${String(hint).slice(0, 100)}`);
          }
        }
      } else if (o.type === 'result') {
        finalText = o.result ?? '';
        isError = !!o.is_error;
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
  const end = (code, errMsg) => {
    if (done) return;
    done = true;
    clearTimeout(timeout);
    if (buf) onLine(buf);
    if (errMsg) return finishTask(a, task, outBefore, false, errMsg);
    if (task.cancelled) return finishTask(a, task, outBefore, false, '대표님 지시로 작업을 중지했습니다.');
    if (task.timedOut) return finishTask(a, task, outBefore, false, `시간 초과(${SET.taskTimeoutMinutes}분)로 중지했습니다.`);
    let text = finalText;
    if (text == null && resultFromFile && fs.existsSync(resultFile)) text = fs.readFileSync(resultFile, 'utf8');
    if (text == null) text = parser === 'claude-stream' ? '' : stdout;
    text = text.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '').trim();
    const ok = code === 0 && !isError;
    if (!text) text = ok ? '(답변 없이 끝났습니다)' : `오류로 끝났습니다 (종료 코드 ${code}). 아래 터미널 기록을 확인하세요.`;
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
  for (const f of listFiles(path.join(a.dir, 'output'))) {
    if (outBefore.get(f.path) === f.mtime) continue;
    let dest = f.path;
    const srcAbs = path.join(a.dir, 'output', f.path);
    const exists = path.join(SHARED, dest);
    if (fs.existsSync(exists) && !fs.readFileSync(exists).equals(fs.readFileSync(srcAbs))) {
      const prefixed = `${id}-${dest}`;
      if (!fs.existsSync(path.join(SHARED, prefixed))) dest = prefixed;
    }
    fs.mkdirSync(path.dirname(path.join(SHARED, dest)), { recursive: true });
    fs.copyFileSync(srcAbs, path.join(SHARED, dest));
    files.push(dest);
  }
  if (files.length) emit('files', listFiles(SHARED));

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
  addChat({ from: id, text: shown.slice(0, 6000), files, ok, jobId: job.id });
  job.results.push({ agentId: id, text: shown, files, ok, kind: task.kind });
  if (task.kind === 'delegated') job.needsReview = true;
  for (const d of delegations) enqueue(d.target, { kind: 'delegated', instruction: d.body, from: id, job, canDelegate: false });

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
};

function safeJoin(base, rel) {
  const p = path.normalize(path.join(base, decodeURIComponent(rel)));
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (p === '/api/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': hi\n\n');
    clients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }
  if (p === '/api/state') {
    const bg = ['png', 'jpg', 'jpeg', 'webp'].map((e) => `office-bg.${e}`).find((f) => fs.existsSync(path.join(PUBLIC, f))) || null;
    return json(res, {
      lead: LEAD, mock: MOCK, background: bg,
      agents: order.map(snapshot),
      logs: Object.fromEntries(order.map((id) => [id, agents[id].log.slice(-200)])),
      chat: chat.slice(-200),
      files: listFiles(SHARED),
    });
  }
  if (p === '/api/message' && req.method === 'POST') {
    const body = await readBody(req);
    let text = String(body.text || '').trim();
    let to = body.to && agents[body.to] ? body.to : LEAD;
    const m = text.match(/^@(\S+)\s*([\s\S]*)$/);
    if (m && resolveAgent(m[1])) { to = resolveAgent(m[1]); text = m[2].trim(); }
    if (!text) return json(res, { error: '내용이 비어 있습니다' }, 400);
    addChat({ from: 'me', to, text });
    createJob(to, text);
    return json(res, { ok: true, to });
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
  if (p.startsWith('/files/')) return serveFile(res, safeJoin(SHARED, p.slice(7)));
  if (p === '/') return serveFile(res, path.join(PUBLIC, 'index.html'));
  return serveFile(res, safeJoin(PUBLIC, p.slice(1)));
});

// 내 컴퓨터에서만 접속 가능 (127.0.0.1). 직원들이 파일을 만들 수 있으므로 외부에 열지 않습니다.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🏢 AI 오피스 출근 완료! 브라우저에서 여세요 → http://localhost:${PORT}`);
  if (MOCK) console.log('   (연습 모드: 실제 AI 대신 가짜 직원이 일합니다)');
  console.log('   종료: 이 창에서 Ctrl + C\n');
});
