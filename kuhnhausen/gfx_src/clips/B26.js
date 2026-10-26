// B26 · L-B26_GFX_card_v2_신분증 · 오버레이 · 6초
// 첫 카드(B25)는 그대로 두고 두 번째 카드 "신분증" + "침대 밑", "서랍장" 두 방향 옐로우 점선 화살표
window.CLIP = {
  file: "L-B26_GFX_card_v2_신분증",
  format: "overlay",
  duration: 6,
  build(stage, tl) {
    const c1 = window.evCard(stage, { left: 1380, top: 150, width: 460 }, "이빨 자국 → 범인");
    const c2 = window.evCard(stage, { left: 1380, top: 420, width: 460 }, "신분증");
    window.evCardIn(tl, c2, 0.4);
    const svg = K.svg(stage);
    const arrows = [[1110, 360], [1110, 640]].map(([x, y]) => {
      const p = K.node(svg, "path", { d: `M 1370 520 Q 1240 ${(520 + y) / 2} ${x + 20} ${y}`, fill: "none", stroke: "#FFD400",
        "stroke-width": 5, "stroke-dasharray": "12 10", "stroke-linecap": "round" });
      return { p, x, y };
    });
    arrows.forEach(({ p, x, y }, i) => {
      gsap.set(p, { opacity: 0 });
      tl.to(p, { opacity: 1, duration: 0.3 }, 1.4 + i * 0.25);
      const head = K.node(svg, "path", { d: "M 0 0 L 22 -12 L 22 12 Z", fill: "#FFD400", transform: `translate(${x} ${y})` });
      gsap.set(head, { opacity: 0 });
      tl.to(head, { opacity: 1, duration: 0.2 }, 1.6 + i * 0.25);
    });
    const labs = [["침대 밑", 360], ["서랍장", 640]].map(([t, y], i) => {
      const l = K.chip(stage, t, { right: 1920 - 1100, top: y - 33 }, 40);
      K.inUp(tl, l, 1.8 + i * 0.25);
      return l;
    });
    K.hold(tl, 6);
  },
};
