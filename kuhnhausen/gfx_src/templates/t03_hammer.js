// T03 망치 아이콘: 오른쪽 위. 인물 아이콘 두 개(왼쪽 '수전', 오른쪽 '남자') 아래에 망치. 망치는 쥔 쪽 아래로 이동
// 인물 디자인 확정 전 임시 원형 아이콘
// buildT03(stage, tl, { start: 'susan'|'man', moves: [{to, at, dur}], inAt })
(function () {
  const D = 104, GAP = 40, RIGHT = 1840, TOP = 60;
  const X = { susan: RIGHT - D * 2 - GAP, man: RIGHT - D };

  window.buildT03 = function (stage, tl, cfg) {
    const root = K.div(stage, { left: "0px", top: "0px" });
    for (const [key, name] of [["susan", "수전"], ["man", "남자"]]) {
      K.div(root, { left: X[key] + "px", top: TOP + "px", width: D + "px", height: D + "px", borderRadius: "50%",
        border: "4px solid var(--white)", background: "var(--black)", color: "var(--white)", fontSize: "32px",
        fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }, name);
    }
    // 망치 실루엣(화이트)
    const hw = 96, hh = 56;
    const hammer = K.div(root, { left: "0px", top: TOP + D + 14 + "px", width: hw + "px", height: hh + "px" });
    hammer.innerHTML = `<svg width="${hw}" height="${hh}" viewBox="0 0 96 56">
      <g fill="#F2F2F2" transform="rotate(-18 48 28)">
        <rect x="10" y="25" width="62" height="9" rx="3"/>
        <path d="M66 10 h18 a4 4 0 0 1 4 4 v8 h4 v10 h-4 v8 a4 4 0 0 1 -4 4 h-18 Z"/>
      </g></svg>`;
    const xOf = (k) => X[k] + (D - hw) / 2;
    gsap.set(hammer, { x: xOf(cfg.start) });
    (cfg.moves || []).forEach((m) => {
      tl.to(hammer, { x: xOf(m.to), duration: m.dur ?? 0.25, ease: "power3.inOut" }, m.at);
    });
    if (cfg.inAt != null) {
      gsap.set(root, { opacity: 0, y: -10 });
      tl.to(root, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, cfg.inAt);
    }
    return { root, hammer };
  };
})();
