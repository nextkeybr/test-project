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
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  return r.json();
}

// ---------- 사무실 장면 ----------
const els = {};
function buildScene(bg) {
  const layer = $('#layer');
  if (bg) { $('#bg').innerHTML = `<img src="${esc(bg)}" alt="">`; $('#scene').classList.add('custom'); }
  else $('#bg').innerHTML = officeBG();
  for (const id of S.order) {
    const a = S.agents[id];
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
    place(chair, a.desk.x + 1.8, a.desk.y - 3.5);
    place(desk, a.desk.x, a.desk.y);
    place(tag, a.desk.x, a.desk.y + 8.6);
    els[id] = { chair, desk, tag, ch, imgKey: '' };
    updateScene(id, true);
  }
}
function place(el, x, y) { el.style.left = x + '%'; el.style.top = y + '%'; }

function updateScene(id, instant) {
  const a = S.agents[id], e = els[id];
  if (!e) return;
  const atDesk = a.status === 'working';
  const pos = atDesk ? { x: a.desk.x + 1.8, y: a.desk.y + 0.2 } : a.rest;
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
  e.tag.innerHTML = `<i class="dot d-${a.status}"></i>${esc(a.name)}${a.queue ? ` <small>+${a.queue}</small>` : ''}`;
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
    return `<li class="staff-item ${S.selected === id ? 'sel' : ''} ${a.off ? 'is-off' : ''}" data-id="${id}">
      <span class="mini">${avatar(a)}</span>
      <div class="si-main">
        <div><b>${esc(fullName(a))}</b> <span class="pill p-${a.status}">${STATUS[a.status]}</span> <span class="eng">${esc(a.engineLabel)}</span></div>
        <div class="si-line">${esc(line || '')}</div>
      </div></li>`;
  }).join('');
  document.querySelectorAll('.staff-item').forEach((li) => li.addEventListener('click', () => select(li.dataset.id)));
}

// ---------- 채팅 / 파일 ----------
function fileChip(f) {
  return `<a class="file" href="/files/${f.split('/').map(encodeURIComponent).join('/')}" target="_blank">📎 ${esc(f)}</a>`;
}
function chatItem(m) {
  if (m.from === 'system') return `<div class="msg sys">${esc(m.text)}</div>`;
  const me = m.from === 'me';
  const a = S.agents[m.from];
  const who = me ? `나 → ${esc(S.agents[m.to] ? S.agents[m.to].name : '')}` : esc(a ? fullName(a) : m.from);
  const av = me ? '<span class="mini me">나</span>' : `<span class="mini">${a ? avatar(a) : ''}</span>`;
  return `<div class="msg ${me ? 'mine' : ''} ${m.ok === false ? 'fail' : ''}">
    ${av}<div class="m-body"><div class="m-h"><b>${who}</b> <span class="muted">${time(m.time)}</span></div>
    <div class="m-text">${esc(m.text)}</div>${(m.files || []).map(fileChip).join('')}</div></div>`;
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
  $('#cToggle').textContent = a.off ? '출근' : '퇴근';
  $('#cStop').disabled = a.status !== 'working';
  $('#cInput').placeholder = `${a.name}에게 직접 지시하기 — Enter`;
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
  buildScene(st.background);
  renderStaff(); renderChat(); renderFiles(); renderConsole(true);
  setInterval(idleChatter, 4500);

  const es = new EventSource('/api/events');
  es.addEventListener('agent', (ev) => {
    const a = JSON.parse(ev.data);
    S.agents[a.id] = a;
    updateScene(a.id);
    renderStaff();
    if (a.id === S.selected) renderConsole(false);
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
}

$('#chatForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const t = $('#chatInput').value.trim();
  if (!t) return;
  $('#chatInput').value = '';
  await api('/api/message', { text: t, to: S.lead });
});
$('#cForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const t = $('#cInput').value.trim();
  if (!t || !S.selected) return;
  $('#cInput').value = '';
  await api('/api/message', { text: t, to: S.selected });
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

init();
