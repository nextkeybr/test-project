// B17 · L-B17_GFX_diagram_v2_왼쪽-관자놀이 · 오버레이 · 3초
// 정면 머리 실루엣(화이트 선, 윤곽만). 본인의 왼쪽 관자놀이 = 정면에서 보면 화면 오른쪽. 피 표현 없이 점과 파동만
window.CLIP = {
  file: "L-B17_GFX_diagram_v2_왼쪽-관자놀이",
  format: "overlay",
  duration: 3,
  build(stage, tl) {
    const svg = K.svg(stage);
    const W = { stroke: "#F2F2F2", "stroke-width": 6, fill: "none", "stroke-linecap": "round" };
    const head = K.node(svg, "g", W);
    K.node(head, "ellipse", { cx: 1380, cy: 420, rx: 140, ry: 178 });
    K.node(head, "path", { d: "M 1310 585 L 1305 650 M 1450 585 L 1455 650 M 1305 650 C 1200 670 1130 700 1100 790 M 1455 650 C 1560 670 1630 700 1660 790" });
    K.inUp(tl, head, 0.1, 0.4);
    const T = [1500, 360];
    const rings = [0, 1].map(() => K.node(svg, "circle", { cx: T[0], cy: T[1], r: 14, fill: "none", stroke: "#E8202A", "stroke-width": 5 }));
    const dot = K.node(svg, "circle", { cx: T[0], cy: T[1], r: 15, fill: "#E8202A" });
    gsap.set(dot, { scale: 0, transformOrigin: "50% 50%" });
    tl.to(dot, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 0.6);
    rings.forEach((r, i) => {
      gsap.set(r, { opacity: 0 });
      for (let k = 0; k < 2; k++) {
        const at = 0.7 + i * 0.45 + k * 0.9;
        tl.fromTo(r, { attr: { r: 14 }, opacity: 1 }, { attr: { r: 70 }, opacity: 0, duration: 0.9, ease: "power2.out", immediateRender: false }, at);
      }
    });
    const lead = K.node(svg, "path", { d: `M ${T[0] + 20} ${T[1] - 14} L 1575 292 L 1610 292`, fill: "none", stroke: "#F2F2F2", "stroke-width": 3 });
    K.draw(tl, lead, 0.9, 0.3);
    const lab = K.label(stage, "왼쪽 관자놀이", { left: 1580, top: 236 }, "mid");
    gsap.set(lab, { x: 0 });
    lab.style.left = "1612px";
    K.inUp(tl, lab, 1.1, 0.35);
    K.hold(tl, 3);
  },
};
