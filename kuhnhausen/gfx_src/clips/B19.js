// B19 · L-B19_GFX_card_v2_돈-금고-없음 · 풀프레임 · 3.5초(비트 7초 중 앞부분)
window.CLIP = {
  file: "L-B19_GFX_card_v2_돈-금고-없음",
  format: "full",
  duration: 3.5,
  build(stage, tl) {
    const cards = [["돈", 520], ["금고", 1040]].map(([t, x]) => {
      const c = K.div(stage, { left: x + "px", top: "300px", width: "360px", height: "260px", border: "4px solid var(--white)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--white)", fontSize: "80px", fontWeight: "800" }, t);
      return c;
    });
    K.inUp(tl, cards[0], 0.3);
    K.inUp(tl, cards[1], 0.4);
    // 1.5초: 레드 ✕ 선이 각 카드를 그으며 지나감
    const svg = K.svg(stage);
    [[520, 300], [1040, 300]].forEach(([x, y], i) => {
      const a = K.node(svg, "line", { x1: x - 20, y1: y - 20, x2: x + 380, y2: y + 280, stroke: "#E8202A", "stroke-width": 12, "stroke-linecap": "round" });
      const b = K.node(svg, "line", { x1: x + 380, y1: y - 20, x2: x - 20, y2: y + 280, stroke: "#E8202A", "stroke-width": 12, "stroke-linecap": "round" });
      K.draw(tl, a, 1.5 + i * 0.3, 0.22, "power2.in");
      K.draw(tl, b, 1.62 + i * 0.3, 0.22, "power2.in");
    });
    K.hold(tl, 3.5);
  },
};
