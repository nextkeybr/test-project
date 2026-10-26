// B10 · L-B10_GFX_label_v1_별거-1년째 · 오버레이 · 4초 (부부 사진 RP-006 위)
// 화면 가운데를 세로로 가르는 금(화이트, 1.5초 동안 위에서 아래로). 말자막 자리(y 880~) 앞에서 옅어지며 끝남
window.CLIP = {
  file: "L-B10_GFX_label_v1_별거-1년째",
  format: "overlay",
  duration: 4,
  build(stage, tl) {
    const svg = K.svg(stage);
    const defs = K.node(svg, "defs");
    const g = K.node(defs, "linearGradient", { id: "fade", x1: 0, y1: 0, x2: 0, y2: 880, gradientUnits: "userSpaceOnUse" });
    K.node(g, "stop", { offset: "0.78", "stop-color": "#F2F2F2", "stop-opacity": 1 });
    K.node(g, "stop", { offset: "1", "stop-color": "#F2F2F2", "stop-opacity": 0 });
    let d = "M 960 0", x = 960;
    for (let y = 36, i = 0; y <= 880; y += 36, i++) {
      x = 960 + (K.hash(i + 3) - 0.5) * 44;
      d += ` L ${x.toFixed(1)} ${y}`;
    }
    const crack = K.node(svg, "path", { d, fill: "none", stroke: "url(#fade)", "stroke-width": 5, "stroke-linejoin": "miter" });
    K.draw(tl, crack, 0.2, 1.5, "power1.in");
    const lab = K.label(stage, "별거 1년째", { left: 80, top: 760 }, "big");
    K.inUp(tl, lab, 0.4);
    K.out(tl, [svg, lab], 3.7);
    K.hold(tl, 4);
  },
};
