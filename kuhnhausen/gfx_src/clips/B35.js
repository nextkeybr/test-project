// B35 · L-B35_GFX_doc_v1_강도처럼-보이게 · T09 · 풀프레임 · 8초
// RD-003 캡처가 아직 없어 문장만 카드로(형광펜 없이). 시작 0.2초 노이즈 글리치(이 클립만 허용)
window.CLIP = {
  file: "L-B35_GFX_doc_v1_강도처럼-보이게",
  format: "full",
  duration: 8,
  build(stage, tl) {
    const d = buildT09(stage, tl, {
      paperAt: 0,
      sentences: [{ en: "It was supposed to look like a home invasion robbery.", ko: "강도 사건처럼 보이게 할 계획이었다.", at: 1.0 }],
      source: "공식 자료 · 멀트노마 카운티 2017",
      sourceAt: 1.4,
    });
    // 글리치: 종이를 가로 띠로 잘라 어긋나게 + 레드 잔상
    const ghost = d.paper.cloneNode(true);
    Object.assign(ghost.style, { background: "var(--red)", mixBlendMode: "normal" });
    d.root.insertBefore(ghost, d.paper);
    return (t) => {
      const on = t < 0.2;
      ghost.style.opacity = on ? 0.55 : 0;
      if (on) {
        const f = Math.floor(t * 30);
        const a = Math.floor(K.hash(f) * 60), b = a + 8 + Math.floor(K.hash(f + 9) * 30);
        d.paper.style.opacity = 1;
        d.paper.style.transform = `translateX(${(K.hash(f + 3) - 0.5) * 60}px)`;
        d.paper.style.clipPath = `polygon(0 0,100% 0,100% ${a}%,0 ${a}%,0 ${b}%,100% ${b}%,100% 100%,0 100%)`;
        ghost.style.transform = `translateX(${(K.hash(f + 5) - 0.5) * 90}px)`;
        ghost.style.clipPath = `inset(${a}% 0 ${100 - b}% 0)`;
      } else {
        d.paper.style.clipPath = "none";
      }
    };
  },
};
