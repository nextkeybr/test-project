// 사무실 그림 (SVG, 1500 x 1000 = 3:2 기준)
// - officeRoom(): 벽·바닥·창문 같은 "방 배경". 내 배경 이미지(office-bg.png)로 바꿀 수 있음
// - officeFurniture(): 소파·러그·커피바 같은 가구. 배경을 바꿔도 항상 위에 그려짐
(function () {
  const L = '#6b5650';
  const W = 1500, H = 1000;
  window.SCENE = { W, H, wall: 170 };

  function plant(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="-48" rx="14" ry="30" fill="#8fcf9c" stroke="${L}" stroke-width="2" transform="rotate(-28 0 -30)"/>
      <ellipse cx="0" cy="-52" rx="14" ry="32" fill="#a6dcae" stroke="${L}" stroke-width="2" transform="rotate(22 0 -30)"/>
      <ellipse cx="0" cy="-58" rx="12" ry="30" fill="#7cc48b" stroke="${L}" stroke-width="2"/>
      <path d="M-22 -18 h44 l-6 34 h-32 z" fill="#f4b9a3" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="-25" y="-22" width="50" height="9" rx="4" fill="#f7c9b6" stroke="${L}" stroke-width="2"/>
    </g>`;
  }

  window.officeRoom = function () {
    let planks = '';
    for (let y = 230; y < H; y += 60) planks += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ead6b6" stroke-width="2"/>`;
    for (let r = 0, y = 170; y < H; y += 60, r++) for (let x = (r % 2) * 130; x < W; x += 260) planks += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 60}" stroke="#ead6b6" stroke-width="2"/>`;
    let lights = '';
    for (let i = 0; i < 30; i++) {
      const x = 20 + i * 50, y = 14 + Math.sin(i * 1.3) * 3 + (i % 2) * 6;
      lights += `<circle class="twinkle" style="animation-delay:${(i % 5) * 0.4}s" cx="${x}" cy="${y}" r="6" fill="${['#ffd36b', '#ff9fb2', '#9fd8ff', '#b8f0b0'][i % 4]}"/>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#eaf7ff"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="#f7e9d4"/>
      ${planks}
      <rect width="${W}" height="172" fill="#fde6ea"/>
      <rect y="160" width="${W}" height="14" fill="#efc7cf"/>
      <path d="M0 14 Q375 34 750 14 T${W} 14" fill="none" stroke="#9c8378" stroke-width="2"/>
      ${lights}
      <circle cx="560" cy="86" r="34" fill="#fff" stroke="${L}" stroke-width="3"/>
      <line x1="560" y1="86" x2="560" y2="64" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
      <line x1="560" y1="86" x2="576" y2="94" stroke="${L}" stroke-width="3" stroke-linecap="round"/>
      ${[660, 940, 1220].map((x) => `
        <rect x="${x}" y="34" width="250" height="110" rx="10" fill="url(#sky)" stroke="${L}" stroke-width="3"/>
        <line x1="${x + 125}" y1="34" x2="${x + 125}" y2="144" stroke="${L}" stroke-width="2.4"/>
        <ellipse cx="${x + 62}" cy="80" rx="26" ry="10" fill="#fff"/><ellipse cx="${x + 185}" cy="62" rx="22" ry="8" fill="#fff"/>
        <path d="M${x - 8} 28 q22 60 4 122 h-12 v-122 z" fill="#ffd1dc" stroke="${L}" stroke-width="2"/>
        <path d="M${x + 258} 28 q-22 60 -4 122 h12 v-122 z" fill="#ffd1dc" stroke="${L}" stroke-width="2"/>`).join('')}
      ${plant(1488, 240, 1)}
    </svg>`;
  };

  window.officeFurniture = function () {
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient></defs>
      <!-- 커피바 -->
      <rect x="110" y="120" width="330" height="120" rx="12" fill="#a9d7c3" stroke="${L}" stroke-width="3"/>
      <rect x="100" y="110" width="350" height="18" rx="7" fill="#f4efe6" stroke="${L}" stroke-width="3"/>
      <rect x="140" y="52" width="66" height="58" rx="9" fill="#e9eef4" stroke="${L}" stroke-width="3"/>
      <circle cx="173" cy="76" r="11" fill="#9c8378"/>
      <rect x="226" y="78" width="24" height="32" rx="6" fill="#fff" stroke="${L}" stroke-width="2.4"/>
      <rect x="258" y="82" width="24" height="28" rx="6" fill="#ffd1dc" stroke="${L}" stroke-width="2.4"/>
      <path d="M300 110 v-28 h120 v28" fill="#fff7e8" stroke="${L}" stroke-width="2.4"/>
      <circle cx="330" cy="84" r="11" fill="#f6b26b" stroke="${L}" stroke-width="2"/>
      <circle cx="362" cy="84" r="11" fill="#f7d36b" stroke="${L}" stroke-width="2"/>
      <circle cx="394" cy="84" r="11" fill="#ffb3c7" stroke="${L}" stroke-width="2"/>
      <text x="275" y="200" text-anchor="middle" font-size="24" font-weight="800" fill="${L}" font-family="sans-serif">COFFEE</text>

      <!-- 러그 -->
      <ellipse cx="270" cy="790" rx="250" ry="165" fill="#fcd4de" stroke="#f1b8c6" stroke-width="4"/>
      <ellipse cx="270" cy="790" rx="212" ry="132" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="6 14"/>

      <!-- 소파 -->
      <rect x="40" y="430" width="460" height="96" rx="38" fill="#f6a9bb" stroke="${L}" stroke-width="3.4"/>
      <rect x="24" y="500" width="492" height="96" rx="32" fill="#f9bccb" stroke="${L}" stroke-width="3.4"/>
      <rect x="10" y="462" width="56" height="140" rx="26" fill="#f6a9bb" stroke="${L}" stroke-width="3.4"/>
      <rect x="474" y="462" width="56" height="140" rx="26" fill="#f6a9bb" stroke="${L}" stroke-width="3.4"/>
      <line x1="200" y1="508" x2="200" y2="588" stroke="#e48ea3" stroke-width="3"/>
      <line x1="340" y1="508" x2="340" y2="588" stroke="#e48ea3" stroke-width="3"/>

      <!-- 커피 테이블 -->
      <rect x="190" y="700" width="160" height="70" rx="20" fill="#f0d2a8" stroke="${L}" stroke-width="3.4"/>
      <rect x="214" y="712" width="24" height="22" rx="6" fill="#fff" stroke="${L}" stroke-width="2.4"/>
      <circle cx="310" cy="734" r="16" fill="#ffd36b" stroke="${L}" stroke-width="2.4"/>

      <!-- 빈백 -->
      <ellipse cx="120" cy="925" rx="92" ry="52" fill="#b5dcc3" stroke="${L}" stroke-width="3.4"/>
      <ellipse cx="420" cy="925" rx="92" ry="52" fill="#c9d9f6" stroke="${L}" stroke-width="3.4"/>

      <!-- 스탠드 -->
      <circle cx="530" cy="300" r="110" fill="url(#glow)"/>
      <line x1="530" y1="300" x2="530" y2="430" stroke="${L}" stroke-width="4"/>
      <path d="M502 302 h56 l-10 -36 h-36 z" fill="#fff3c4" stroke="${L}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="530" cy="432" rx="22" ry="7" fill="#9c8378"/>
    </svg>`;
  };

  window.deskSVG = function () {
    return `<svg viewBox="0 0 170 100" xmlns="http://www.w3.org/2000/svg">
      <g class="monitor">
        <rect class="mon-glow" x="2" y="4" width="62" height="46" rx="14" fill="#bfe3ff" opacity="0"/>
        <rect x="8" y="10" width="50" height="34" rx="8" fill="#d9dfea" stroke="${L}" stroke-width="2.4"/>
        <circle cx="33" cy="27" r="3.5" fill="#bfc8d8"/>
        <rect x="28" y="42" width="10" height="5" fill="#c6cedb" stroke="${L}" stroke-width="1.6"/>
      </g>
      <rect x="2" y="44" width="166" height="34" rx="12" fill="#f0d2a8" stroke="${L}" stroke-width="2.6"/>
      <rect x="10" y="74" width="150" height="24" rx="8" fill="#e3bd8c" stroke="${L}" stroke-width="2.6"/>
      <rect x="122" y="48" width="16" height="14" rx="4" fill="#fff" stroke="${L}" stroke-width="1.8"/>
      <rect x="142" y="52" width="20" height="14" rx="2" fill="#fff8e8" stroke="${L}" stroke-width="1.6" transform="rotate(-8 152 59)"/>
      <circle cx="18" cy="58" r="5" fill="#a6dcae" stroke="${L}" stroke-width="1.5"/>
    </svg>`;
  };

  window.chairSVG = function () {
    return `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="2" width="68" height="56" rx="22" fill="#c9b6f2" stroke="${L}" stroke-width="2.6"/>
      <rect x="16" y="10" width="48" height="30" rx="12" fill="#d8caf6"/>
    </svg>`;
  };
})();
