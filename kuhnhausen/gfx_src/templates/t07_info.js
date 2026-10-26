// T07 정보 카드: 옐로우 바탕 + 블랙 큰 글자(72px), 그 아래 블랙 바탕 + 옐로우 보조 글자(40px). 한 글자씩 타이핑
// buildT07(stage, tl, cfg)
//   cfg.big {text, at, dur}      큰 글자 (dur: 타이핑에 걸리는 시간)
//   cfg.subs [{text, at, dur}]   보조 줄들
//   cfg.pos  'center' 또는 {left, bottom} / {left, top}
//   cfg.bigSize, cfg.subSize     글자 크기(기본 72 / 40)
//   cfg.outAt                    퇴장 시각(없으면 유지)
(function () {
  function typed(parent, tl, text, at, dur, style) {
    const box = K.div(parent, Object.assign({ position: "relative", whiteSpace: "pre", lineHeight: "1" }, style));
    const chars = [...text].map((c) => {
      const s = document.createElement("span");
      s.textContent = c;
      box.appendChild(s);
      return s;
    });
    gsap.set(box, { opacity: 0 });
    gsap.set(chars, { display: "none" });
    tl.set(box, { opacity: 1 }, at);
    const step = dur / chars.length;
    chars.forEach((c, i) => tl.set(c, { display: "inline" }, at + 0.05 + i * step));
    return box;
  }

  window.buildT07 = function (stage, tl, cfg) {
    const wrap = K.div(stage, { display: "flex", flexDirection: "column", alignItems: "flex-start" });
    if (cfg.pos === "center") {
      Object.assign(wrap.style, { left: "50%", top: (cfg.centerY ?? 440) + "px", alignItems: "center" });
      gsap.set(wrap, { xPercent: -50, yPercent: -50 });
    } else {
      Object.assign(wrap.style, K.px(cfg.pos));
    }
    const bigSize = cfg.bigSize ?? 72, subSize = cfg.subSize ?? 40;
    const parts = [];
    if (cfg.big) {
      parts.push(typed(wrap, tl, cfg.big.text, cfg.big.at, cfg.big.dur ?? Math.min(0.8, cfg.big.text.length * 0.07), {
        background: "var(--yellow)", color: "var(--black)", fontSize: bigSize + "px", fontWeight: "800",
        padding: `${Math.round(bigSize * 0.26)}px ${Math.round(bigSize * 0.42)}px ${Math.round(bigSize * 0.3)}px`,
        minHeight: Math.round(bigSize * 1.56) + "px", order: cfg.big.order ?? 0 }));
    }
    (cfg.subs || []).forEach((s, i) => {
      parts.push(typed(wrap, tl, s.text, s.at, s.dur ?? Math.min(0.8, s.text.length * 0.04), {
        background: "var(--black)", color: "var(--yellow)", fontSize: subSize + "px", fontWeight: "700",
        padding: `${Math.round(subSize * 0.35)}px ${Math.round(subSize * 0.6)}px ${Math.round(subSize * 0.4)}px`,
        minHeight: Math.round(subSize * 1.75) + "px", order: s.order ?? i + 1 }));
    });
    if (cfg.outAt != null) {
      tl.to(wrap, { opacity: 0, x: -24, duration: 0.28, ease: "power2.in" }, cfg.outAt);
    }
    return { wrap, parts };
  };
})();
