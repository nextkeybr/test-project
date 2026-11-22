// 기본 캐릭터 (직접 그린 오리지널 SVG). 내 이미지로 바꾸려면 public/characters/<직원id>.png 를 넣으세요.
(function () {
  const LINE = '#5b4a44';
  function ears(t, c, a) {
    switch (t) {
      case 'bunny':
        return `<ellipse cx="35" cy="6" rx="8.5" ry="22" fill="${c}" stroke="${LINE}" stroke-width="2.4" transform="rotate(-8 35 6)"/>
                <ellipse cx="35" cy="8" rx="3.8" ry="15" fill="${a}" opacity=".75" transform="rotate(-8 35 8)"/>
                <ellipse cx="65" cy="6" rx="8.5" ry="22" fill="${c}" stroke="${LINE}" stroke-width="2.4" transform="rotate(8 65 6)"/>
                <ellipse cx="65" cy="8" rx="3.8" ry="15" fill="${a}" opacity=".75" transform="rotate(8 65 8)"/>`;
      case 'cat':
        return `<path d="M18 36 L22 8 L42 24 Z" fill="${c}" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M23 29 L25 15 L35 24 Z" fill="${a}" opacity=".75"/>
                <path d="M82 36 L78 8 L58 24 Z" fill="${c}" stroke="${LINE}" stroke-width="2.4" stroke-linejoin="round"/>
                <path d="M77 29 L75 15 L65 24 Z" fill="${a}" opacity=".75"/>`;
      case 'bear':
        return `<circle cx="22" cy="24" r="11" fill="${c}" stroke="${LINE}" stroke-width="2.4"/><circle cx="22" cy="24" r="5.5" fill="${a}" opacity=".6"/>
                <circle cx="78" cy="24" r="11" fill="${c}" stroke="${LINE}" stroke-width="2.4"/><circle cx="78" cy="24" r="5.5" fill="${a}" opacity=".6"/>`;
      case 'hamster':
        return `<circle cx="24" cy="25" r="8" fill="${a}" stroke="${LINE}" stroke-width="2.4"/>
                <circle cx="76" cy="25" r="8" fill="${a}" stroke="${LINE}" stroke-width="2.4"/>`;
      case 'dog':
        return `<ellipse cx="16" cy="44" rx="9" ry="17" fill="${a}" stroke="${LINE}" stroke-width="2.4" transform="rotate(18 16 44)"/>
                <ellipse cx="84" cy="44" rx="9" ry="17" fill="${a}" stroke="${LINE}" stroke-width="2.4" transform="rotate(-18 84 44)"/>`;
      case 'chick':
        return `<path d="M47 20 C44 10 50 6 50 6 C50 6 52 12 50 20 M52 20 C55 12 60 12 60 12 C60 12 58 18 53 21" fill="none" stroke="${LINE}" stroke-width="2.4" stroke-linecap="round"/>`;
      default:
        return '';
    }
  }
  function extras(t, a) {
    if (t === 'hamster') return `<path d="M22 34 Q50 14 78 34 Q66 30 50 30 Q34 30 22 34 Z" fill="${a}" opacity=".85"/>`;
    if (t === 'dog') return `<ellipse cx="64" cy="44" rx="10" ry="8" fill="${a}" opacity=".45"/>`;
    return '';
  }
  function mouth(t) {
    if (t === 'chick') return `<path d="M45 61 L55 61 L50 67 Z" fill="#ffb347" stroke="${LINE}" stroke-width="1.6" stroke-linejoin="round"/>`;
    if (t === 'cat') return `<path d="M44 60 q3 4 6 0 q3 4 6 0" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>`;
    return `<path d="M46 61 q4 4 8 0" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>`;
  }
  window.charSVG = function (ch) {
    const t = ch.type || 'bear', c = ch.color || '#fff', a = ch.accent || '#ffb3c7';
    return `<svg viewBox="0 -18 100 120" xmlns="http://www.w3.org/2000/svg" class="ch-svg">
      <g class="ch-body">
        <ellipse cx="50" cy="99" rx="26" ry="4" fill="#000" opacity=".08"/>
        <ellipse cx="50" cy="84" rx="25" ry="15" fill="${c}" stroke="${LINE}" stroke-width="2.4"/>
        <ellipse class="arm-l" cx="28" cy="80" rx="6" ry="8" fill="${c}" stroke="${LINE}" stroke-width="2.2"/>
        <ellipse class="arm-r" cx="72" cy="80" rx="6" ry="8" fill="${c}" stroke="${LINE}" stroke-width="2.2"/>
        ${ears(t, c, a)}
        <ellipse cx="50" cy="50" rx="37" ry="31" fill="${c}" stroke="${LINE}" stroke-width="2.4"/>
        ${extras(t, a)}
        <g class="eyes">
          <ellipse cx="37" cy="51" rx="3.4" ry="4.4" fill="#2b2623"/><circle cx="38.2" cy="49.4" r="1.2" fill="#fff"/>
          <ellipse cx="63" cy="51" rx="3.4" ry="4.4" fill="#2b2623"/><circle cx="64.2" cy="49.4" r="1.2" fill="#fff"/>
        </g>
        <ellipse cx="28" cy="60" rx="6.5" ry="3.6" fill="${a}" opacity=".7"/>
        <ellipse cx="72" cy="60" rx="6.5" ry="3.6" fill="${a}" opacity=".7"/>
        ${mouth(t)}
      </g>
    </svg>`;
  };
})();
