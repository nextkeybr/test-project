'use strict';
const $ = (s) => document.querySelector(s);
const S = { agents: {}, order: [], chat: [], files: [], logs: {}, selected: null, lead: null };
const STATUS = { working: '일하는 중', idle: '쉬는 중', waiting: '차례 대기', off: '퇴근' };
const IDLE_LINES = ['커피 맛있다~', '오늘도 화이팅!', '쉬는 중~', '다음 업무 기다리는 중', '하암~', '간식 먹고 싶다', '잠깐 스트레칭!'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const time = (t) => new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
const fullName = (a) => `${a.name} ${a.nickname || ''}`.trim();

function avatar(a, work) {
  const img = work && a.workImage ? a.workImage : a.image;
  return img ? `<img src="${esc(img)}" alt="">` : charSVG(a.character || {});
}

async function api(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Office': '1' }, body: JSON.stringify(body || {}) });
  const j = await r.json().catch(() => ({}));
  if (j.error) toast(j.error);
  return j;
}

// ---------- 사무실 장면 ----------
const els = {};
// 직원 수에 맞춰 책상·라운지 자리를 자동 배치 (3열, 줄이 늘면 조금씩 작게)
const REST_SPOTS = [[18.3, 34], [9, 60], [18, 60], [27, 60], [8, 95], [28, 95], [18, 80], [31, 36], [5, 36], [13, 80], [24, 80], [18, 95]];
let LAYOUT = {};
function computeLayout() {
  const n = S.order.length, rows = Math.max(2, Math.ceil(n / 3));
  const scale = rows <= 2 ? 1 : rows === 3 ? 0.8 : 0.66;
  const ys = rows <= 2 ? [50, 86] : Array.from({ length: rows }, (_, i) => 38 + i * (48 / (rows - 1)));
  LAYOUT = { scale };
  S.order.forEach((id, i) => {
    const r = REST_SPOTS[i % REST_SPOTS.length];
    LAYOUT[id] = { desk: { x: [47.5, 68.5, 89.5][i % 3], y: ys[Math.floor(i / 3)] }, rest: { x: r[0], y: r[1] } };
  });
  document.documentElement.style.setProperty('--sc', scale);
  // 직원 목록 높이: 3명씩 한 줄, 3줄까지는 스크롤 없이 다 보이게
  const listRows = Math.min(3, Math.ceil(n / 3));
  document.documentElement.style.setProperty('--staffH', `${50 + listRows * 52 + 10}px`);
}
function setBackground(bg) {
  S.background = bg || null;
  $('#bg').innerHTML = bg ? `<img src="${esc(bg)}" alt="">` : officeRoom();
}
function buildScene(bg) {
  const layer = $('#layer');
  setBackground(bg);
  $('#furniture').innerHTML = officeFurniture();
  computeLayout();
  for (const id of S.order) {
    const a = { ...S.agents[id], ...LAYOUT[id] };
    const chair = document.createElement('div');
    chair.className = 'chair';
    chair.innerHTML = chairSVG();
    const desk = document.createElement('div');
    desk.className = 'desk';
    desk.innerHTML = deskSVG();
    const tag = document.createElement('div');
    tag.className = 'tag';
    const ch = document.createElement('div');
    ch.className = 'char';
    ch.innerHTML = `<div class="bubble"></div><div class="ch-img"></div><div class="prop">${esc(a.prop || '')}</div>`;
    for (const el of [chair, desk, tag, ch]) {
      el.dataset.id = id;
      el.addEventListener('click', () => select(id));
      layer.appendChild(el);
    }
    place(chair, a.desk.x + 3.5 * LAYOUT.scale, a.desk.y - 3.5 * LAYOUT.scale);
    place(desk, a.desk.x, a.desk.y);
    place(tag, a.desk.x, a.desk.y + 6.7 * LAYOUT.scale);
    chair.style.zIndex = Math.round(a.desk.y * 10) - 100;
    desk.style.zIndex = Math.round(a.desk.y * 10) + 40;
    tag.style.zIndex = Math.round(a.desk.y * 10) + 41; // 앞줄 캐릭터의 말풍선보다는 아래
    els[id] = { chair, desk, tag, ch, imgKey: '' };
    updateScene(id, true);
  }
}
function place(el, x, y) { el.style.left = x + '%'; el.style.top = y + '%'; }

function updateScene(id, instant) {
  const e = els[id];
  if (!e || !S.agents[id]) return;
  const a = { ...S.agents[id], ...LAYOUT[id] };
  const atDesk = a.status === 'working';
  const pos = atDesk ? { x: a.desk.x + 3.5 * LAYOUT.scale, y: a.desk.y + 2.5 * LAYOUT.scale } : a.rest;
  e.ch.style.zIndex = Math.round(pos.y * 10); // 아래쪽(앞쪽)에 있는 캐릭터가 위로 보이게
  if (instant) e.ch.style.transition = 'none';
  const moved = e.ch.style.left && (e.ch.style.left !== pos.x + '%' || e.ch.style.top !== pos.y + '%');
  place(e.ch, pos.x, pos.y);
  if (instant) { void e.ch.offsetWidth; e.ch.style.transition = ''; }
  if (moved && !instant) { e.ch.classList.remove('hop'); void e.ch.offsetWidth; e.ch.classList.add('hop'); }
  e.ch.className = `char s-${a.status}${atDesk ? ' at-desk' : ''}${S.selected === id ? ' sel' : ''}${e.ch.classList.contains('hop') ? ' hop' : ''}`;
  e.desk.classList.toggle('on', atDesk);
  e.desk.classList.toggle('sel', S.selected === id);
  const key = `${a.status === 'working'}|${a.image}|${a.workImage}`;
  if (e.imgKey !== key) { e.ch.querySelector('.ch-img').innerHTML = avatar(a, a.status === 'working'); e.imgKey = key; }
  e.tag.innerHTML = `<i class="dot d-${a.status}"></i>${esc(fullName(a))}${a.queue ? ` <small>+${a.queue}</small>` : ''}`;
  const b = e.ch.querySelector('.bubble');
  let text = '';
  if (a.status === 'working') text = a.lastLine || '일하는 중...';
  else if (a.status === 'waiting') text = '차례 기다리는 중';
  b.textContent = text.replace(/^[💬🔧▶]\s*/u, '');
  b.classList.toggle('show', !!text);
}

function idleChatter() {
  const idle = S.order.filter((id) => S.agents[id].status === 'idle');
  if (!idle.length) return;
  const id = idle[Math.floor(Math.random() * idle.length)];
  const b = els[id]?.ch.querySelector('.bubble');
  if (!b || b.classList.contains('show')) return;
  b.textContent = IDLE_LINES[Math.floor(Math.random() * IDLE_LINES.length)];
  b.classList.add('show');
  setTimeout(() => { if (S.agents[id].status === 'idle') b.classList.remove('show'); }, 3200);
}

// ---------- 직원 목록 ----------
function renderStaff() {
  const on = S.order.filter((id) => !S.agents[id].off).length;
  $('#attend').textContent = `출근 ${on} / ${S.order.length}`;
  $('#staffList').innerHTML = S.order.map((id) => {
    const a = S.agents[id];
    const line = a.status === 'working' ? a.lastLine : a.status === 'waiting' ? `대기 업무 ${a.queue}건` : a.role;
    return `<li title="${esc(a.engineLabel)}" class="staff-item ${S.selected === id ? 'sel' : ''} ${a.off ? 'is-off' : ''}" data-id="${id}">
      <span class="mini">${avatar(a)}</span>
      <div class="si-main">
        <div class="si-top"><b>${esc(fullName(a))}</b> <span class="pill p-${a.status}">${STATUS[a.status]}</span></div>
        <div class="si-line">${esc(line || '')}</div>
      </div></li>`;
  }).join('');
  document.querySelectorAll('.staff-item').forEach((li) => li.addEventListener('click', () => select(li.dataset.id)));
}

// ---------- 채팅 / 파일 ----------
const EXT_KIND = { image: /\.(png|jpe?g|webp|gif|svg|bmp)$/i, video: /\.(mp4|mov|webm|m4v|avi|mkv)$/i, audio: /\.(mp3|wav|m4a|aac|ogg|flac)$/i };
const ICON = { image: '🖼', video: '🎬', audio: '🎵' };
const kindOfName = (f) => Object.keys(EXT_KIND).find((k) => EXT_KIND[k].test(f)) || 'doc';
const fileUrl = (f) => `/files/${f.split('/').map(encodeURIComponent).join('/')}`;
const shortName = (f) => f.split('/').pop();
function fileChip(f) {
  const k = kindOfName(f);
  if (k === 'image' && !/\.heic$/i.test(f)) return `<a class="file thumb" href="${fileUrl(f)}" data-path="${esc(f)}" title="${esc(f)}"><img src="${fileUrl(f)}" alt="" loading="lazy"><span>${esc(shortName(f))}</span></a>`;
  return `<a class="file" href="${fileUrl(f)}" data-path="${esc(f)}" title="${esc(f)}">${ICON[k] || '📄'} ${esc(shortName(f))}</a>`;
}
function helpCard(h) {
  const btn = h.action === 'setup' ? '<button type="button" class="btn sm dark" data-act="setup">🩺 시작 준비 열기</button>'
    : h.action === 'manager' ? '<button type="button" class="btn sm dark" data-act="manager">⚙️ 직원 관리 열기</button>' : '';
  return `<div class="help-card"><b>💡 ${esc(h.title)}</b>${esc(h.fix)}${btn ? '<br>' + btn : ''}</div>`;
}
document.addEventListener('click', (e) => {
  const b = e.target.closest?.('[data-act]');
  if (!b) return;
  if (b.dataset.act === 'setup') openSetup();
  if (b.dataset.act === 'manager') openManager();
});
function chatItem(m) {
  if (m.from === 'system') return `<div class="msg sys">${esc(m.text)}</div>`;
  const me = m.from === 'me';
  const a = S.agents[m.from];
  const who = me ? `나 → ${esc(S.agents[m.to] ? S.agents[m.to].name : '')}` : esc(a ? fullName(a) : m.from);
  const av = me ? '<span class="mini me">나</span>' : `<span class="mini">${a ? avatar(a) : ''}</span>`;
  return `<div class="msg ${me ? 'mine' : ''} ${m.ok === false ? 'fail' : ''}">
    ${av}<div class="m-body"><div class="m-h"><b>${who}</b> <span class="muted">${time(m.time)}</span></div>
    <div class="m-text">${esc(m.text)}</div>${(m.files || []).map(fileChip).join('')}${m.help ? helpCard(m.help) : ''}</div></div>`;
}
function renderChat() {
  const box = $('#chatList');
  const stick = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  box.innerHTML = S.chat.length ? S.chat.map(chatItem).join('') : '<div class="empty">아직 대화가 없어요.<br>아래 칸에 비서에게 첫 업무를 지시해 보세요!<br><small>예: 다음 주 올릴 쇼츠 아이디어 5개 기획해줘</small></div>';
  if (stick) box.scrollTop = box.scrollHeight;
}
function renderFiles() {
  $('#fileCount').textContent = S.files.length;
  const sorted = [...S.files].sort((a, b) => b.mtime - a.mtime);
  $('#fileList').innerHTML = sorted.length
    ? sorted.map((f) => `<div class="frow">${fileChip(f.path)}<span class="muted small">${new Date(f.mtime).toLocaleString('ko-KR')}</span></div>`).join('')
    : '<div class="empty">아직 결과물이 없어요.<br>직원이 만든 파일이 여기에 모입니다 (ai-office/shared 폴더).</div>';
}

// ---------- 하단 터미널 ----------
function select(id) {
  S.selected = id;
  nickEditing(false);
  renderStaff();
  S.order.forEach((x) => updateScene(x));
  renderConsole(true);
}
function renderConsole(scroll) {
  const a = S.agents[S.selected];
  if (!a) return;
  $('#cAvatar').innerHTML = avatar(a);
  $('#cName').textContent = fullName(a);
  $('#cStatus').className = `pill p-${a.status}`;
  $('#cStatus').textContent = STATUS[a.status] + (a.queue ? ` · 대기 ${a.queue}` : '');
  $('#cEngine').textContent = a.engineLabel;
  $('#cToggle').textContent = a.off ? '☀️ 출근' : '🌙 퇴근';
  $('#cStop').disabled = a.status !== 'working';
  $('#cInput').placeholder = `${a.name}에게 직접 지시 (파일은 끌어다 놓기)`;
  if (scroll) {
    const pre = $('#cLog');
    pre.textContent = (S.logs[a.id] || []).join('\n') || `${fullName(a)}의 작업 화면입니다. 업무를 주면 여기에 실시간으로 보여요.`;
    pre.scrollTop = pre.scrollHeight;
  }
}

// ---------- 시작 ----------
async function init() {
  const st = await (await fetch('/api/state')).json();
  S.lead = st.lead;
  S.order = st.agents.map((a) => a.id);
  st.agents.forEach((a) => { S.agents[a.id] = a; });
  S.chat = st.chat; S.files = st.files; S.logs = st.logs;
  S.selected = S.lead;
  if (st.mock) $('#mockBadge').classList.remove('hidden');
  S.ffmpeg = st.ffmpeg;
  S.engines = st.engines || [];
  S.charTypes = st.charTypes || [];
  buildScene(st.background);
  renderStaff(); renderChat(); renderFiles(); renderConsole(true);
  setInterval(idleChatter, 4500);

  checkVersion();
  // 처음이거나 로그인이 풀린 AI가 있으면 시작 준비 창을 자동으로 띄움
  if (!st.mock) fetch('/api/setup').then((r) => r.json()).then((su) => {
    if (su.engines.some((e) => e.needed && (!e.installed || e.loggedIn === false))) openSetup(su);
  }).catch(() => {});
  const es = new EventSource('/api/events');
  // 서버가 다시 켜지면(업데이트 등) 화면을 자동으로 새로고침
  let lost = false;
  es.onerror = () => { lost = true; };
  es.onopen = () => { if (lost) location.reload(); };
  es.addEventListener('agent', (ev) => {
    const a = JSON.parse(ev.data);
    S.agents[a.id] = a;
    updateScene(a.id);
    renderStaff();
    if (a.id === S.selected) renderConsole(false);
    if (!$('#mgr').classList.contains('hidden') && !document.activeElement?.closest?.('#mgForm')) renderManager();
  });
  es.addEventListener('log', (ev) => {
    const { id, line } = JSON.parse(ev.data);
    (S.logs[id] = S.logs[id] || []).push(line);
    if (S.logs[id].length > 400) S.logs[id].shift();
    if (id === S.selected) {
      const pre = $('#cLog');
      const stick = pre.scrollHeight - pre.scrollTop - pre.clientHeight < 60;
      if (pre.textContent.endsWith('보여요.')) pre.textContent = '';
      pre.textContent += (pre.textContent ? '\n' : '') + line;
      if (stick) pre.scrollTop = pre.scrollHeight;
    }
  });
  es.addEventListener('chat', (ev) => { S.chat.push(JSON.parse(ev.data)); renderChat(); });
  es.addEventListener('files', (ev) => { S.files = JSON.parse(ev.data); renderFiles(); });
  es.addEventListener('roster', () => location.reload());
  es.addEventListener('setup-log', (ev) => {
    const pre = $('#suLog');
    pre.textContent += (pre.textContent ? '\n' : '') + JSON.parse(ev.data).line;
    pre.scrollTop = pre.scrollHeight;
  });
  es.addEventListener('setup-url', (ev) => {
    const { url } = JSON.parse(ev.data);
    try { if (/^(localhost|127\.0\.0\.1)$/.test(new URL(url).hostname)) return; } catch { return; }
    if ($('#suUrls').querySelector('a')) return; // 첫 로그인 주소 하나만
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = '👉 로그인 페이지가 안 열렸다면 여기를 누르세요';
    $('#suUrls').appendChild(a);
  });
  es.addEventListener('background', (ev) => { setBackground(JSON.parse(ev.data).url); });
}

// ---------- 보내기 + 이어서 하기 (지난 결과물 고르기) ----------
const ATT = { chat: [], c: [] };
const CONTINUE_RE = /이어서|이어가|이어 가|이어하|계속 이어|어제\s*(작업|한|만든|하던)|지난번|저번에?\s*(작업|한|만든)/;
const FORM = {
  chat: { input: '#chatInput', chips: '#chatAtt', to: () => S.lead },
  c: { input: '#cInput', chips: '#cAtt', to: () => S.selected },
};
function dayLabel(t) {
  const d = new Date(t), now = new Date();
  const day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86400000);
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  if (diff < 7) return `${diff}일 전`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
function renderAtt(k) {
  const box = $(FORM[k].chips);
  box.classList.toggle('hidden', !ATT[k].length);
  box.innerHTML = ATT[k].map((f, i) => `<span class="att"><span>${ICON[kindOfName(f)] || '📄'} ${esc(shortName(f))}</span><button type="button" data-i="${i}" title="빼기">×</button></span>`).join('');
  box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { ATT[k].splice(+b.dataset.i, 1); renderAtt(k); }));
}
async function submitFrom(k) {
  const input = $(FORM[k].input);
  const t = input.value.trim();
  const to = FORM[k].to();
  if (!t || !to) return;
  const send = async () => {
    input.value = '';
    const attachments = ATT[k];
    ATT[k] = [];
    renderAtt(k);
    await api('/api/message', { text: t, to, attachments });
  };
  if (!ATT[k].length && CONTINUE_RE.test(t) && S.files.length) {
    return openPicker(k, send, '어떤 작업을 이어갈까요? 고르고 "선택 완료"를 누르면 바로 보냅니다.');
  }
  send();
}
$('#chatForm').addEventListener('submit', (e) => { e.preventDefault(); submitFrom('chat'); });
$('#cForm').addEventListener('submit', (e) => { e.preventDefault(); submitFrom('c'); });

let PK = null;
function groupFiles() {
  const groups = new Map();
  for (const f of S.files) {
    const key = f.jobId || `etc-${dayLabel(f.mtime)}`;
    if (!groups.has(key)) groups.set(key, { title: f.request || '기타 파일', time: 0, by: new Set(), files: [] });
    const g = groups.get(key);
    g.files.push(f);
    g.time = Math.max(g.time, f.time || f.mtime);
    if (f.by && S.agents[f.by]) g.by.add(S.agents[f.by].name);
    if (f.by === 'me') g.by.add('나');
  }
  return [...groups.values()].sort((a, b) => b.time - a.time);
}
function openPicker(k, sendAfter, note) {
  PK_LAST = k;
  PK = { k, sendAfter, groups: groupFiles() };
  const chosen = new Set(ATT[k]);
  $('#pkNote').textContent = note || '지난 작업 결과물을 골라 주세요. 여러 개를 고를 수 있어요.';
  $('#pkSkip').classList.toggle('hidden', !sendAfter);
  $('#pkList').innerHTML = (PK.groups.length ? '' : '<div class="empty">아직 결과물이 없어요.<br>아래 "내 컴퓨터에서 올리기"로 파일을 올려 보세요.</div>') + PK.groups.map((g, gi) => `
    <div class="pk-group">
      <label class="pk-gh"><input type="checkbox" class="gcb" data-g="${gi}">
        <div><b>${g.title === '기타 파일' ? '기타 파일' : '“' + esc(g.title) + '”'}</b>
        <small>${dayLabel(g.time)} · ${[...g.by].map(esc).join(', ') || '직원'} · 파일 ${g.files.length}개</small></div></label>
      <div class="pk-files">${g.files.sort((a, b) => a.path.localeCompare(b.path)).map((f) => `
        <label><input type="checkbox" class="fcb" data-g="${gi}" value="${esc(f.path)}" ${chosen.has(f.path) ? 'checked' : ''}>
        <span>${ICON[kindOfName(f.path)] || '📄'} ${esc(f.path.startsWith('uploads/') ? shortName(f.path) : f.path)}</span><small>${f.by === 'me' ? '나' : f.by && S.agents[f.by] ? esc(S.agents[f.by].name) : ''}</small></label>`).join('')}
      </div>
    </div>`).join('');
  const sync = () => {
    PK.groups.forEach((g, gi) => {
      const boxes = [...document.querySelectorAll(`.fcb[data-g="${gi}"]`)];
      const n = boxes.filter((b) => b.checked).length;
      const gcb = document.querySelector(`.gcb[data-g="${gi}"]`);
      gcb.checked = n === boxes.length;
      gcb.indeterminate = n > 0 && n < boxes.length;
    });
    const total = document.querySelectorAll('.fcb:checked').length;
    $('#pkOk').textContent = total ? `선택 완료 (${total}개)${PK.sendAfter ? ' · 보내기' : ''}` : '선택 완료';
  };
  document.querySelectorAll('.gcb').forEach((g) => g.addEventListener('change', () => {
    document.querySelectorAll(`.fcb[data-g="${g.dataset.g}"]`).forEach((b) => { b.checked = g.checked; });
    sync();
  }));
  document.querySelectorAll('.fcb').forEach((b) => b.addEventListener('change', sync));
  sync();
  $('#picker').classList.remove('hidden');
}
function closePicker() { $('#picker').classList.add('hidden'); PK = null; }
document.querySelectorAll('.clip').forEach((b) => b.addEventListener('click', () => openPicker(b.dataset.for)));
$('#pkUpload').addEventListener('click', () => $('#upPick').click());
$('#upPick').addEventListener('change', (e) => {
  const files = [...e.target.files];
  e.target.value = '';
  if (!files.length || !PK) return;
  const { k, sendAfter } = PK;
  // 이미 체크한 결과물도 같이 붙임
  const checked = [...document.querySelectorAll('.fcb:checked')].map((b) => b.value);
  ATT[k] = [...new Set([...ATT[k], ...checked])];
  renderAtt(k);
  closePicker();
  uploadFiles(k, files).then(() => { if (sendAfter) sendAfter(); });
});
$('#pkClose').addEventListener('click', closePicker);
$('#picker').addEventListener('click', (e) => { if (e.target.id === 'picker') closePicker(); });
$('#pkOk').addEventListener('click', () => {
  if (!PK) return;
  const { k, sendAfter } = PK;
  ATT[k] = [...document.querySelectorAll('.fcb:checked')].map((b) => b.value);
  renderAtt(k);
  closePicker();
  if (sendAfter) sendAfter();
});
$('#pkSkip').addEventListener('click', () => {
  if (!PK) return;
  const { sendAfter } = PK;
  closePicker();
  if (sendAfter) sendAfter();
});

$('#cToggle').addEventListener('click', () => S.selected && api(`/api/agent/${S.selected}/toggle`));
$('#cStop').addEventListener('click', () => S.selected && api(`/api/agent/${S.selected}/stop`));
$('#allOn').addEventListener('click', () => api('/api/all', { off: false }));
$('#allOff').addEventListener('click', () => api('/api/all', { off: true }));
document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === b));
  $('#chatList').classList.toggle('hidden', b.dataset.tab !== 'chat');
  $('#fileList').classList.toggle('hidden', b.dataset.tab !== 'files');
}));

// ---------- 캐릭터 이미지 바꾸기 ----------
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
}
async function uploadImage(id, file, work) {
  if (!file || !/^image\/(png|webp|gif|jpeg)$/.test(file.type)) return toast('png, jpg, webp, gif 이미지만 넣을 수 있어요');
  const r = await fetch(`/api/agent/${id}/image${work ? '?work=1' : ''}`, { method: 'POST', headers: { 'Content-Type': file.type, 'X-Office': '1' }, body: file });
  const j = await r.json();
  if (j.error) return toast(j.error);
  if (els[id]) els[id].imgKey = '';
  toast(`${S.agents[id].name}${work ? ' (일할 때)' : ''} 캐릭터를 바꿨어요 ✨`);
}
let pickTarget = null;
$('#imgPick').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (f && pickTarget) uploadImage(pickTarget.id, f, pickTarget.work);
  e.target.value = '';
});
function closeMenu() { document.querySelector('.img-menu')?.remove(); }
$('#cImg').addEventListener('click', (e) => {
  e.stopPropagation();
  closeMenu();
  const id = S.selected;
  if (!id) return;
  const a = S.agents[id];
  const m = document.createElement('div');
  m.className = 'img-menu';
  const items = [
    ['기본 모습 이미지 고르기', () => { pickTarget = { id, work: false }; $('#imgPick').click(); }],
    ['일할 때 모습 이미지 고르기 (선택)', () => { pickTarget = { id, work: true }; $('#imgPick').click(); }],
  ];
  if (a.image || a.workImage) items.push(['원래 캐릭터로 되돌리기', async () => {
    await fetch(`/api/agent/${id}/image`, { method: 'DELETE', headers: { 'X-Office': '1' } });
    await fetch(`/api/agent/${id}/image?work=1`, { method: 'DELETE', headers: { 'X-Office': '1' } });
    if (els[id]) els[id].imgKey = '';
    toast('원래 캐릭터로 되돌렸어요');
  }]);
  for (const [label, fn] of items) {
    const b = document.createElement('button');
    b.textContent = label;
    b.onclick = () => { closeMenu(); fn(); };
    m.appendChild(b);
  }
  const r = e.target.getBoundingClientRect();
  m.style.left = Math.min(r.left, innerWidth - 260) + 'px';
  m.style.top = (r.top - 8) + 'px';
  m.style.transform = 'translateY(-100%)';
  document.body.appendChild(m);
});
document.addEventListener('click', closeMenu);

// 이미지 파일을 직원 목록이나 캐릭터, 책상 위에 끌어다 놓으면 바로 바뀜
const CHAR_SEL = '.staff-item, .char, .desk, .chair, .tag';
function attachKeyFor(el) {
  if (el.closest?.('.console')) return 'c';
  return 'chat';
}
let lastDrop = null;
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  const t = e.target.closest?.(CHAR_SEL) || e.target.closest?.('.chat, .console');
  if (lastDrop && lastDrop !== t) lastDrop.classList.remove('drop-on');
  if (t) { t.classList.add('drop-on'); lastDrop = t; }
});
document.addEventListener('dragleave', (e) => { if (!e.relatedTarget && lastDrop) lastDrop.classList.remove('drop-on'); });
document.addEventListener('drop', (e) => {
  e.preventDefault();
  if (lastDrop) lastDrop.classList.remove('drop-on');
  const files = [...(e.dataTransfer?.files || [])];
  if (!files.length) return;
  if (!$('#picker').classList.contains('hidden')) { closePicker(); return uploadFiles(PK_LAST || 'chat', files); }
  const charEl = e.target.closest?.(CHAR_SEL);
  // 캐릭터·직원 목록 위에 이미지 1장 → 캐릭터 바꾸기
  if (charEl && files.length === 1 && /^image\//.test(files[0].type)) return uploadImage(charEl.dataset.id, files[0], e.shiftKey);
  // 그 밖(채팅, 아래 작업 창, 사무실 바닥) → 업무 자료로 첨부
  uploadFiles(attachKeyFor(e.target), files);
});

// 내 컴퓨터 파일 올리기 → 첨부 목록에 추가
let PK_LAST = 'chat';
function uploadOne(file, onProgress) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.setRequestHeader('X-Office', '1');
    xhr.setRequestHeader('X-File-Name', encodeURIComponent(file.name));
    xhr.setRequestHeader('Content-Type', 'application/octet-stream');
    xhr.upload.onprogress = (ev) => ev.lengthComputable && onProgress(Math.round((ev.loaded / ev.total) * 100));
    xhr.upload.onload = () => { if (/\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(file.name)) toast(`🎬 ${file.name}: 장면 분석 중... (긴 영상은 조금 걸려요)`); };
    xhr.onload = () => { let j = {}; try { j = JSON.parse(xhr.responseText); } catch {} resolve(j); };
    xhr.onerror = () => resolve({ error: '올리기 실패 (연결 끊김)' });
    xhr.send(file);
  });
}
async function uploadFiles(k, files) {
  let ok = 0;
  for (const f of files) {
    toast(`올리는 중: ${f.name}`);
    const j = await uploadOne(f, (pct) => toast(`올리는 중: ${f.name} ${pct}%`));
    if (j.error) { toast(`${f.name}: ${j.error}`); await new Promise((r) => setTimeout(r, 1800)); continue; }
    if (j.kind === 'video') {
      toast(j.analyzed ? `🎬 ${f.name}: 장면 모음표를 만들었어요` : j.ffmpeg ? `🎬 ${f.name}: 영상 정보를 읽지 못했어요` : `🎬 ${f.name}: ffmpeg 이 없어 장면 분석은 건너뛰었어요`);
      await new Promise((r) => setTimeout(r, 1500));
    }
    if (!ATT[k].includes(j.path)) ATT[k].push(j.path);
    ok++;
    renderAtt(k);
  }
  if (ok) {
    toast(`${ok}개 첨부했어요. 지시를 적고 보내기를 누르세요 📎`);
    $(FORM[k].input).focus();
  }
}

// ---------- 업데이트 ----------
async function checkVersion() {
  try {
    const v = await (await fetch('/api/version')).json();
    const b = $('#updBtn');
    b.title = `현재 버전 ${v.current}`;
    const newer = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); } return false; };
    if (v.latest && v.current !== 'dev' && newer(v.latest, v.current) && v.canUpdate) {
      b.classList.remove('hidden');
      b.textContent = '✨ 새 버전 업데이트';
    }
  } catch {}
}
$('#updBtn').addEventListener('click', async () => {
  if (!confirm('새 버전으로 업데이트할까요?\n채팅 기록, 결과물, 캐릭터 이미지는 그대로 남아요.')) return;
  const b = $('#updBtn');
  b.disabled = true;
  b.textContent = '업데이트 중...';
  const j = await api('/api/update');
  if (j.error) { b.disabled = false; b.textContent = '✨ 새 버전 업데이트'; return; }
  b.textContent = '다시 여는 중...';
});

// ---------- 이름 바꾸기 ----------
function nickEditing(on) {
  $('#cName').classList.toggle('hidden', on);
  $('#cNickBtn').classList.toggle('hidden', on);
  $('#cNickEdit').classList.toggle('hidden', !on);
}
$('#cNickBtn').addEventListener('click', () => {
  const a = S.agents[S.selected];
  if (!a) return;
  $('#cJob').textContent = a.name;
  $('#cNickInput').value = a.nickname || '';
  nickEditing(true);
  $('#cNickInput').focus();
  $('#cNickInput').select();
});
async function saveNick() {
  const v = $('#cNickInput').value.trim();
  if (!v) return toast('이름을 입력해 주세요');
  const j = await api(`/api/agent/${S.selected}/nickname`, { nickname: v });
  if (!j.error) nickEditing(false);
}
$('#cNickSave').addEventListener('click', saveNick);
$('#cNickCancel').addEventListener('click', () => nickEditing(false));
$('#cNickInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); saveNick(); }
  if (e.key === 'Escape') nickEditing(false);
});

// ---------- 파일 미리보기 (사무실 위에 크게, ✕ 로 닫기) ----------
function mdToHtml(md) {
  const blocks = [];
  let h = esc(md).replace(/```[\w-]*\n([\s\S]*?)```/g, (_, c) => { blocks.push(`<pre><code>${c}</code></pre>`); return `\u0000${blocks.length - 1}\u0000`; });
  h = h.replace(/^###### (.*)$/gm, '<h6>$1</h6>').replace(/^##### (.*)$/gm, '<h5>$1</h5>').replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>').replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\s*[-*] (.*)$/gm, '<li>$1</li>').replace(/^\s*\d+\. (.*)$/gm, '<li>$1</li>')
    .replace(/^&gt; (.*)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>');
  return h.replace(/\u0000(\d+)\u0000/g, (_, i) => blocks[+i]);
}
let PV = null;
async function openPreview(path) {
  PV = path;
  const url = fileUrl(path);
  const k = kindOfName(path);
  $('#pvName').textContent = path;
  $('#pvDown').href = url;
  $('#pvDown').setAttribute('download', shortName(path));
  $('#pvBg').classList.toggle('hidden', k !== 'image');
  const body = $('#pvBody');
  body.innerHTML = '<div class="empty">불러오는 중...</div>';
  $('#preview').classList.remove('hidden');
  if (k === 'image') body.innerHTML = `<img src="${url}" alt="">`;
  else if (k === 'video') body.innerHTML = `<video src="${url}" controls autoplay playsinline></video>`;
  else if (k === 'audio') body.innerHTML = `<audio src="${url}" controls autoplay></audio>`;
  else if (/\.(html?|pdf)$/i.test(path)) body.innerHTML = `<iframe src="${url}" sandbox="allow-scripts allow-forms allow-popups"></iframe>`;
  else if (/\.(md|txt|csv|json|srt|vtt|svg|css|js)$/i.test(path)) {
    try {
      const t = await (await fetch(url)).text();
      if (PV !== path) return;
      body.innerHTML = /\.md$/i.test(path) ? `<div class="pv-doc">${mdToHtml(t)}</div>` : `<div class="pv-doc pv-plain">${esc(t)}</div>`;
    } catch { body.innerHTML = '<div class="empty">파일을 열지 못했어요.</div>'; }
  } else body.innerHTML = `<div class="empty">이 파일은 미리보기를 지원하지 않아요.<br>위의 "내려받기"로 열어 주세요.</div>`;
}
function closePreview() {
  PV = null;
  $('#preview').classList.add('hidden');
  $('#pvBody').innerHTML = ''; // 영상·음악 재생 멈춤
}
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a.file[data-path]');
  if (!a) return;
  e.preventDefault();
  openPreview(a.dataset.path);
});
$('#pvClose').addEventListener('click', closePreview);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && PV) closePreview(); });
$('#pvBg').addEventListener('click', async () => {
  if (!PV) return;
  const j = await api('/api/background', { path: PV });
  if (!j.error) { toast('사무실 배경을 바꿨어요 🏠'); closePreview(); }
});

// ---------- 사무실 배경: 디자이너에게 맡기기 / 되돌리기 ----------
function loadImg(src) {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}
const svgSrc = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
// 지금 사무실 모습(가구 + 책상 + 캐릭터)을 그림 파일로 만들어 레퍼런스로 전달
async function sceneSnapshot() {
  const { W, H } = SCENE;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const room = await loadImg(S.background || svgSrc(officeRoom()));
  if (room) g.drawImage(room, 0, 0, W, H);
  const furn = await loadImg(svgSrc(officeFurniture()));
  if (furn) g.drawImage(furn, 0, 0, W, H);
  const desk = await loadImg(svgSrc(deskSVG()));
  const items = [];
  const sc = LAYOUT.scale || 1;
  for (const id of S.order) {
    const a = { ...S.agents[id], ...LAYOUT[id] };
    items.push({ z: a.desk.y * 10 + 40, draw: () => desk && g.drawImage(desk, (a.desk.x - 9.5 * sc) / 100 * W, a.desk.y / 100 * H - (0.19 * sc * W * 100 / 170) / 2, 0.19 * sc * W, 0.19 * sc * W * 100 / 170) });
    const src = a.image ? a.image : svgSrc(charSVG(a.character || {}));
    const img = await loadImg(src);
    const cw = 0.16 * sc * W, chh = a.image ? cw : cw * 1.2;
    items.push({ z: a.rest.y * 10, draw: () => img && g.drawImage(img, a.rest.x / 100 * W - cw / 2, a.rest.y / 100 * H - chh, cw, chh) });
  }
  items.sort((x, y) => x.z - y.z).forEach((it) => it.draw());
  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'));
}
function bgMenu(anchor) {
  closeMenu();
  const m = document.createElement('div');
  m.className = 'img-menu';
  const items = [['🖌 디자이너에게 새 배경 맡기기 (GPT)', designBackground]];
  if (S.background) items.push(['↩ 기본 배경으로 되돌리기', async () => {
    const r = await fetch('/api/background', { method: 'DELETE', headers: { 'X-Office': '1' } });
    if (r.ok) toast('기본 배경으로 되돌렸어요');
  }]);
  for (const [label, fn] of items) {
    const b = document.createElement('button');
    b.textContent = label;
    b.onclick = () => { closeMenu(); fn(); };
    m.appendChild(b);
  }
  const r = anchor.getBoundingClientRect();
  m.style.left = Math.max(8, r.right - 290) + 'px';
  m.style.top = (r.bottom + 6) + 'px';
  document.body.appendChild(m);
}
$('#bgBtn').addEventListener('click', (e) => { e.stopPropagation(); bgMenu(e.currentTarget); });
async function designBackground() {
  if (!confirm('디자이너에게 사무실 배경 디자인을 맡길까요?\n지금 사무실 모습과 캐릭터 이미지를 레퍼런스로 같이 보냅니다.')) return;
  toast('지금 사무실 모습을 레퍼런스로 만드는 중...');
  const blob = await sceneSnapshot();
  const j = blob ? await uploadOne(new File([blob], 'office-current-layout.png', { type: 'image/png' }), () => {}) : { error: '레퍼런스 이미지를 만들지 못했어요' };
  if (j.error) return toast(j.error);
  const r = await api('/api/background/design', { snapshot: j.path });
  if (!r.error) toast('디자이너에게 맡겼어요 🎨 완성되면 채팅에 이미지가 올라와요');
}

// ---------- 직원 관리: 추가 / 삭제 / AI 고르기 ----------
function engineOptions(cur) {
  return S.engines.map((e) => `<option value="${e.key}" ${e.key === cur ? 'selected' : ''} ${e.available === false && e.key !== cur ? 'disabled' : ''}>${esc(e.label)}${e.available === false ? ' (설치 안 됨)' : ''}</option>`).join('');
}
function renderManager() {
  $('#mgList').innerHTML = S.order.map((id) => {
    const a = S.agents[id];
    return `<div class="mg-row" data-id="${id}">
      <span class="mini">${avatar(a)}</span>
      <div class="mg-name"><b>${esc(fullName(a))}</b><small>${esc(a.role || '')}</small></div>
      <select class="mg-engine" title="이 직원이 쓰는 AI">${engineOptions(a.engine)}</select>
      ${id === S.lead ? '<span class="muted small mg-lead">팀 리더</span>' : `<button type="button" class="btn sm mg-del" ${a.status === 'working' ? 'disabled title="일하는 중이라 삭제할 수 없어요"' : ''}>삭제</button>`}
    </div>`;
  }).join('');
  $('#mgCount').textContent = `${S.order.length}명`;
  document.querySelectorAll('.mg-engine').forEach((sel) => sel.addEventListener('change', async () => {
    const id = sel.closest('.mg-row').dataset.id;
    const j = await api(`/api/agent/${id}/engine`, { engine: sel.value });
    if (!j.error) toast(`${S.agents[id].name} → ${sel.options[sel.selectedIndex].text} 적용 ✅`);
  }));
  document.querySelectorAll('.mg-del').forEach((b) => b.addEventListener('click', async () => {
    const id = b.closest('.mg-row').dataset.id;
    if (!confirm(`${fullName(S.agents[id])} 직원을 삭제할까요?\n작업 폴더와 결과물은 지워지지 않아요.`)) return;
    await fetch(`/api/agents/${id}`, { method: 'DELETE', headers: { 'X-Office': '1' } }).then((r) => r.json()).then((j) => j.error && toast(j.error));
  }));
  $('#mgEngine').innerHTML = engineOptions('codex');
  $('#mgType').innerHTML = S.charTypes.map((t) => `<option value="${t}">${{ bunny: '토끼', bear: '곰', cat: '고양이', dog: '강아지', hamster: '햄스터', chick: '병아리' }[t] || t}</option>`).join('');
}
async function openManager() {
  renderManager();
  $('#mgr').classList.remove('hidden');
  // 설치 여부 다시 확인 (방금 설치했을 수도 있으니)
  const j = await api('/api/engines', {});
  if (j.engines) { S.engines = j.engines; renderManager(); }
}
$('#mgBtn').addEventListener('click', openManager);
$('#cEngine').addEventListener('click', openManager);
$('#mgClose').addEventListener('click', () => $('#mgr').classList.add('hidden'));
$('#mgr').addEventListener('click', (e) => { if (e.target.id === 'mgr') $('#mgr').classList.add('hidden'); });
$('#mgForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = Object.fromEntries(f.entries());
  const j = await api('/api/agents', body);
  if (!j.error) { toast('새 직원을 뽑았어요 🎉'); e.target.reset(); }
});

// ---------- 시작 준비 (설치·로그인) ----------
function suRow(ic, title, desc, ok, btns) {
  return `<div class="su-row ${ok ? 'ok' : 'todo'}"><span class="su-ic">${ic}</span><div class="su-main"><b>${title}</b><small>${desc}</small></div>${btns || ''}</div>`;
}
function renderSetup(su) {
  const rows = [];
  rows.push(suRow('✅', 'AI 오피스', '설치 완료', true));
  if (su.platform === 'win32' && !su.git) rows.push(suRow('🧰', 'Git (윈도우용 Claude Code에 필요할 수 있음)', 'Claude Code가 "Git이 필요하다"고 하면 설치하세요.', false, `<button class="btn sm" data-su="install:git">Git 설치하기</button>`));
  for (const e of su.engines) {
    const users = S.order.filter((id) => S.agents[id].engine === e.key).map((id) => S.agents[id].name).join(', ');
    const desc = users ? `쓰는 직원: ${esc(users)}` : e.needed ? '다른 AI가 멈추면 대신 일해요' : '지금 쓰는 직원 없음 (선택)';
    if (!e.installed) rows.push(suRow('⬇️', `${esc(e.label)} — 설치 필요`, desc, false, `<button class="btn sm dark" data-su="install:${e.key}">설치하기</button>`));
    else if (e.loggedIn === false) rows.push(suRow('🔑', `${esc(e.label)} — 로그인 필요`, desc + (e.key === 'claude' ? ' · Claude 유료 구독 계정으로 로그인' : e.key === 'codex' ? ' · ChatGPT 계정으로 로그인' : ''), false, `<button class="btn sm dark" data-su="login:${e.key}">로그인하기</button>`));
    else rows.push(suRow('✅', `${esc(e.label)}`, desc + ' · 준비 완료', true, `<button class="btn sm" data-su="install:${e.key}" title="최신 버전으로 다시 설치">업데이트</button>`));
  }
  rows.push(su.ffmpeg
    ? suRow('✅', 'ffmpeg (선택)', '영상 장면 분석 준비 완료', true)
    : suRow('🎬', 'ffmpeg (선택)', '영상을 올렸을 때 장면을 분석하려면 필요해요. 없어도 사무실은 쓸 수 있어요.', false, `<button class="btn sm" data-su="install:ffmpeg">설치하기</button>`));
  $('#suList').innerHTML = rows.join('');
  const need = su.engines.filter((e) => e.needed && (!e.installed || e.loggedIn === false));
  $('#suSummary').innerHTML = need.length ? `<span style="color:#d6336c">남은 준비 ${need.length}개</span>` : '<span style="color:#2a9a63">모든 준비가 끝났어요 🎉</span>';
  document.querySelectorAll('[data-su]').forEach((b) => b.addEventListener('click', () => {
    const [kind, what] = b.dataset.su.split(':');
    runSetup(kind, what, b.closest('.su-row').querySelector('b').textContent);
  }));
}
async function openSetup(su) {
  $('#setup').classList.remove('hidden');
  if (!su) { $('#suList').innerHTML = '<div class="empty">확인하는 중...</div>'; su = await (await fetch('/api/setup')).json(); }
  renderSetup(su);
}
async function runSetup(kind, what, title) {
  $('#suLogin').classList.remove('hidden');
  $('#suLoginTitle').textContent = kind === 'login' ? `${title}: 브라우저에서 로그인을 마쳐 주세요` : `${title}: 설치 중... (몇 분 걸릴 수 있어요)`;
  $('#suInputForm').classList.toggle('hidden', kind !== 'login');
  $('#suUrls').innerHTML = '';
  $('#suLog').textContent = '';
  document.querySelectorAll('[data-su]').forEach((b) => { b.disabled = true; });
  const r = await fetch(`/api/setup/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Office': '1' }, body: JSON.stringify({ what }) });
  const j = await r.json().catch(() => ({ error: '응답을 읽지 못했어요' }));
  if (j.error) {
    $('#suLoginTitle').textContent = '⚠️ ' + j.error;
    if (j.help) $('#suUrls').innerHTML = helpCard(j.help);
  } else {
    $('#suLoginTitle').textContent = '✅ 완료!';
    setTimeout(() => $('#suLogin').classList.add('hidden'), 1500);
  }
  openSetup();
}
$('#setupBtn').addEventListener('click', () => openSetup());
$('#suRefresh').addEventListener('click', () => openSetup());
$('#suClose').addEventListener('click', () => $('#setup').classList.add('hidden'));
$('#suDone').addEventListener('click', () => $('#setup').classList.add('hidden'));
$('#suCancel').addEventListener('click', () => fetch('/api/setup/cancel', { method: 'POST', headers: { 'X-Office': '1' } }));
$('#suInputForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = $('#suInput').value.trim();
  if (!v) return;
  $('#suInput').value = '';
  api('/api/setup/input', { text: v });
});

init();
