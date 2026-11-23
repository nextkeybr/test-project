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

  checkVersion();
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
  box.innerHTML = ATT[k].map((f, i) => `<span class="att"><span>📎 ${esc(f)}</span><button type="button" data-i="${i}" title="빼기">×</button></span>`).join('');
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
  }
  return [...groups.values()].sort((a, b) => b.time - a.time);
}
function openPicker(k, sendAfter, note) {
  if (!S.files.length) return toast('아직 결과물이 없어요');
  PK = { k, sendAfter, groups: groupFiles() };
  const chosen = new Set(ATT[k]);
  $('#pkNote').textContent = note || '지난 작업 결과물을 골라 주세요. 여러 개를 고를 수 있어요.';
  $('#pkSkip').classList.toggle('hidden', !sendAfter);
  $('#pkList').innerHTML = PK.groups.map((g, gi) => `
    <div class="pk-group">
      <label class="pk-gh"><input type="checkbox" class="gcb" data-g="${gi}">
        <div><b>${g.title === '기타 파일' ? '기타 파일' : '“' + esc(g.title) + '”'}</b>
        <small>${dayLabel(g.time)} · ${[...g.by].map(esc).join(', ') || '직원'} · 파일 ${g.files.length}개</small></div></label>
      <div class="pk-files">${g.files.sort((a, b) => a.path.localeCompare(b.path)).map((f) => `
        <label><input type="checkbox" class="fcb" data-g="${gi}" value="${esc(f.path)}" ${chosen.has(f.path) ? 'checked' : ''}>
        <span>${esc(f.path)}</span><small>${f.by && S.agents[f.by] ? esc(S.agents[f.by].name) : ''}</small></label>`).join('')}
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
function dropTargetId(el) {
  const t = el.closest?.('.staff-item, .char, .desk, .chair, .tag, .console');
  if (!t) return null;
  return t.classList.contains('console') ? S.selected : t.dataset.id;
}
let lastDrop = null;
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  const t = e.target.closest?.('.staff-item, .char, .desk, .chair, .tag, .console');
  if (lastDrop && lastDrop !== t) lastDrop.classList.remove('drop-on');
  if (t) { t.classList.add('drop-on'); lastDrop = t; }
});
document.addEventListener('dragleave', (e) => { if (!e.relatedTarget && lastDrop) lastDrop.classList.remove('drop-on'); });
document.addEventListener('drop', (e) => {
  e.preventDefault();
  if (lastDrop) lastDrop.classList.remove('drop-on');
  const id = dropTargetId(e.target);
  const f = e.dataTransfer.files[0];
  if (!f) return;
  if (!id) return toast('직원 목록이나 캐릭터 위에 놓아 주세요');
  uploadImage(id, f, e.shiftKey);
});

// ---------- 업데이트 ----------
async function checkVersion() {
  try {
    const v = await (await fetch('/api/version')).json();
    const b = $('#updBtn');
    b.title = `현재 버전 ${v.current}`;
    if (v.latest && v.latest !== v.current && v.canUpdate) {
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

init();
