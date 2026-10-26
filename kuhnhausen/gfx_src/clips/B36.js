// B36 · L-B36_GFX_label_v1_장갑-분해라벨 · 오버레이 · 6초
// 3D 손 분해 영상에 맞춰 라벨 위치를 다시 맞춰야 함(지금은 가운데 기준). 각 층에서 오른쪽으로 호출선
window.CLIP = {
  file: "L-B36_GFX_label_v1_장갑-분해라벨",
  format: "overlay",
  duration: 6,
  build(stage, tl) {
    const svg = K.svg(stage);
    const els = [svg];
    [["노란 고무장갑", 250], ["라텍스 장갑", 420], ["손", 590]].forEach(([t, y], i) => {
      const at = 0.5 + i * 0.5;
      const dot = K.node(svg, "circle", { cx: 980, cy: y, r: 9, fill: "#FFD400" });
      gsap.set(dot, { opacity: 0 });
      tl.to(dot, { opacity: 1, duration: 0.2 }, at);
      const line = K.node(svg, "path", { d: `M 990 ${y} L 1180 ${y}`, stroke: "#F2F2F2", "stroke-width": 3, fill: "none" });
      K.draw(tl, line, at + 0.05, 0.3);
      const l = K.label(stage, t, { left: 1196, top: y - 29 }, "mid");
      K.inUp(tl, l, at + 0.25, 0.35);
      els.push(l);
    });
    const bottom = K.div(stage, { left: "50%", top: "730px", background: "var(--yellow)", color: "var(--black)", fontSize: "48px",
      fontWeight: "800", lineHeight: "1", padding: "16px 28px 18px", whiteSpace: "nowrap" }, "지문을 숨기려는 준비");
    gsap.set(bottom, { xPercent: -50 });
    K.inUp(tl, bottom, 2.4);
    els.push(bottom);
    K.out(tl, els, 5.7);
    K.hold(tl, 6);
  },
};
