// 사무실 배경 그림 (SVG, 1200 x 720 기준). 내 배경 이미지를 쓰려면 public/office-bg.png 를 넣으세요.
(function () {
  const L = '#6b5650';
  function plant(x, y, s = 1) {
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="-48" rx="14" ry="30" fill="#8fcf9c" stroke="${L}" stroke-width="2" transform="rotate(-28 0 -30)"/>
      <ellipse cx="0" cy="-52" rx="14" ry="32" fill="#a6dcae" stroke="${L}" stroke-width="2" transform="rotate(22 0 -30)"/>
      <ellipse cx="0" cy="-58" rx="12" ry="30" fill="#7cc48b" stroke="${L}" stroke-width="2"/>
      <path d="M-22 -18 h44 l-6 34 h-32 z" fill="#f4b9a3" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="-25" y="-22" width="50" height="9" rx="4" fill="#f7c9b6" stroke="${L}" stroke-width="2"/>
    </g>`;
  }
  function books(x, y, w) {
    const cols = ['#f6a5b8', '#9fd3e6', '#ffe08a', '#b6e3b0', '#c9b6f2', '#ffc29a'];
    let s = '', cx = x;
    let i = 0;
    while (cx < x + w - 10) {
      const bw = 9 + ((i * 7) % 6), bh = 26 + ((i * 11) % 10);
      s += `<rect x="${cx}" y="${y - bh}" width="${bw}" height="${bh}" rx="2" fill="${cols[i % cols.length]}" stroke="${L}" stroke-width="1.5"/>`;
      cx += bw + 2; i++;
    }
    return s;
  }
  window.officeBG = function () {
    let planks = '';
    for (let y = 175; y < 720; y += 46) planks += `<line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="#e6d0ae" stroke-width="2"/>`;
    for (let r = 0, y = 130; y < 720; y += 46, r++) for (let x = (r % 2) * 110; x < 1200; x += 220) planks += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 46}" stroke="#e6d0ae" stroke-width="2"/>`;
    let lights = '';
    for (let i = 0; i < 24; i++) {
      const x = 20 + i * 50, y = 12 + Math.sin(i * 1.3) * 3 + (i % 2) * 6;
      lights += `<circle class="twinkle" style="animation-delay:${(i % 5) * 0.4}s" cx="${x}" cy="${y}" r="4.5" fill="${['#ffd36b', '#ff9fb2', '#9fd8ff', '#b8f0b0'][i % 4]}"/>`;
    }
    return `<svg viewBox="0 0 1200 720" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#eaf7ff"/></linearGradient>
        <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="1200" height="720" fill="#f5e6cf"/>
      ${planks}
      <rect width="1200" height="132" fill="#fde6ea"/>
      <rect y="124" width="1200" height="10" fill="#efc7cf"/>
      <path d="M0 10 Q300 26 600 10 T1200 10" fill="none" stroke="#9c8378" stroke-width="1.5"/>
      ${lights}

      <!-- 책장 -->
      <rect x="28" y="26" width="214" height="100" rx="6" fill="#e7c49a" stroke="${L}" stroke-width="2.4"/>
      <line x1="28" y1="76" x2="242" y2="76" stroke="${L}" stroke-width="2.4"/>
      ${books(38, 74, 196)}${books(38, 122, 120)}
      ${plant(205, 120, .55)}

      <!-- 커피바 -->
      <rect x="392" y="62" width="216" height="74" rx="8" fill="#a9d7c3" stroke="${L}" stroke-width="2.4"/>
      <rect x="386" y="56" width="228" height="12" rx="5" fill="#f4efe6" stroke="${L}" stroke-width="2.2"/>
      <rect x="410" y="20" width="44" height="38" rx="6" fill="#e9eef4" stroke="${L}" stroke-width="2.2"/>
      <circle cx="432" cy="36" r="7" fill="#9c8378"/>
      <rect x="470" y="36" width="16" height="20" rx="4" fill="#fff" stroke="${L}" stroke-width="2"/>
      <rect x="492" y="38" width="16" height="18" rx="4" fill="#ffd1dc" stroke="${L}" stroke-width="2"/>
      <path d="M520 56 v-18 h52 v18" fill="#fff7e8" stroke="${L}" stroke-width="2"/>
      <circle cx="534" cy="38" r="7" fill="#f6b26b" stroke="${L}" stroke-width="1.6"/>
      <circle cx="556" cy="38" r="7" fill="#f7d36b" stroke="${L}" stroke-width="1.6"/>
      <text x="500" y="108" text-anchor="middle" font-size="15" font-weight="700" fill="${L}">COFFEE</text>

      <!-- 시계 -->
      <circle cx="642" cy="62" r="24" fill="#fff" stroke="${L}" stroke-width="2.6"/>
      <line x1="642" y1="62" x2="642" y2="46" stroke="${L}" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="642" y1="62" x2="654" y2="68" stroke="${L}" stroke-width="2.6" stroke-linecap="round"/>

      <!-- 창문 -->
      ${[700, 930].map((x) => `
        <rect x="${x}" y="24" width="200" height="88" rx="8" fill="url(#sky)" stroke="${L}" stroke-width="2.6"/>
        <line x1="${x + 100}" y1="24" x2="${x + 100}" y2="112" stroke="${L}" stroke-width="2.2"/>
        <ellipse cx="${x + 50}" cy="60" rx="22" ry="9" fill="#fff"/><ellipse cx="${x + 150}" cy="46" rx="18" ry="7" fill="#fff"/>
        <path d="M${x - 8} 18 q20 50 4 100 h-10 v-100 z" fill="#ffd1dc" stroke="${L}" stroke-width="2"/>
        <path d="M${x + 208} 18 q-20 50 -4 100 h10 v-100 z" fill="#ffd1dc" stroke="${L}" stroke-width="2"/>`).join('')}

      <!-- 라운지 -->
      <ellipse cx="200" cy="470" rx="190" ry="125" fill="#fcd4de" stroke="#f1b8c6" stroke-width="3"/>
      <ellipse cx="200" cy="470" rx="160" ry="100" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 10"/>
      <rect x="62" y="262" width="300" height="56" rx="24" fill="#f6a9bb" stroke="${L}" stroke-width="2.6"/>
      <rect x="48" y="300" width="328" height="56" rx="20" fill="#f9bccb" stroke="${L}" stroke-width="2.6"/>
      <rect x="40" y="282" width="34" height="80" rx="15" fill="#f6a9bb" stroke="${L}" stroke-width="2.6"/>
      <rect x="350" y="282" width="34" height="80" rx="15" fill="#f6a9bb" stroke="${L}" stroke-width="2.6"/>
      <line x1="160" y1="306" x2="160" y2="350" stroke="#e48ea3" stroke-width="2"/>
      <line x1="262" y1="306" x2="262" y2="350" stroke="#e48ea3" stroke-width="2"/>
      <rect x="140" y="430" width="130" height="54" rx="14" fill="#f0d2a8" stroke="${L}" stroke-width="2.6"/>
      <rect x="160" y="438" width="18" height="16" rx="4" fill="#fff" stroke="${L}" stroke-width="1.8"/>
      <circle cx="232" cy="455" r="12" fill="#ffd36b" stroke="${L}" stroke-width="1.8"/>
      <rect x="54" y="540" width="86" height="58" rx="22" fill="#b5dcc3" stroke="${L}" stroke-width="2.6"/>
      <rect x="282" y="540" width="86" height="58" rx="22" fill="#b5dcc3" stroke="${L}" stroke-width="2.6"/>

      <!-- 스탠드 -->
      <circle cx="400" cy="250" r="70" fill="url(#glow)"/>
      <line x1="400" y1="250" x2="400" y2="330" stroke="${L}" stroke-width="3"/>
      <path d="M380 252 h40 l-8 -26 h-24 z" fill="#fff3c4" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="400" cy="332" rx="16" ry="5" fill="#9c8378"/>

      <!-- 화분 -->
      ${plant(30, 690, .9)}${plant(440, 690, .85)}${plant(1168, 690, .95)}${plant(1168, 220, .8)}${plant(640, 200, .7)}
    </svg>`;
  };
  window.deskSVG = function () {
    return `<svg viewBox="0 0 170 110" xmlns="http://www.w3.org/2000/svg">
      <g class="monitor">
        <rect class="mon-glow" x="10" y="-6" width="70" height="56" rx="12" fill="#bfe3ff" opacity="0"/>
        <rect x="18" y="0" width="54" height="40" rx="7" fill="#d9dfea" stroke="${L}" stroke-width="2.2"/>
        <circle cx="45" cy="20" r="4" fill="#bfc8d8"/>
        <rect x="40" y="38" width="10" height="8" fill="#c6cedb" stroke="${L}" stroke-width="1.6"/>
      </g>
      <rect x="2" y="42" width="166" height="38" rx="10" fill="#f0d2a8" stroke="${L}" stroke-width="2.4"/>
      <rect x="10" y="78" width="150" height="26" rx="6" fill="#e3bd8c" stroke="${L}" stroke-width="2.4"/>
      <rect x="120" y="48" width="16" height="14" rx="4" fill="#fff" stroke="${L}" stroke-width="1.8"/>
      <rect x="140" y="52" width="20" height="14" rx="2" fill="#fff8e8" stroke="${L}" stroke-width="1.6" transform="rotate(-8 150 59)"/>
      <circle cx="18" cy="56" r="5" fill="#a6dcae" stroke="${L}" stroke-width="1.5"/>
    </svg>`;
  };
  window.chairSVG = function () {
    return `<svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="2" width="68" height="56" rx="20" fill="#c9b6f2" stroke="${L}" stroke-width="2.4"/>
      <rect x="16" y="10" width="48" height="30" rx="12" fill="#d8caf6"/>
    </svg>`;
  };
})();
