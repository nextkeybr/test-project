// B15 · L-B15_GFX_diagram_v1_망치-반경 · 풀프레임 · 7초 (일반 원리 설명)
// 옆에서 본 두 인물 실루엣(화이트 선). 남자 어깨에서 망치가 그리는 호(레드)
// 0~3초 멀리 떨어져 큰 호 → 3~5초 수전이 바짝 다가감 → 5~7초 호가 작게 줄어듦
window.CLIP = {
  file: "L-B15_GFX_diagram_v1_망치-반경",
  format: "full",
  duration: 7,
  build(stage, tl) {
    const svg = K.svg(stage);
    const W = { stroke: "#F2F2F2", "stroke-width": 6, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" };
    // 사람(옆모습): (x, 발끝 y), 얼굴 방향 dir(-1 왼쪽, 1 오른쪽)
    function figure(x, dir, armUp) {
      const g = K.node(svg, "g", Object.assign({}, W));
      K.node(g, "circle", { cx: 0, cy: -430, r: 38 });
      K.node(g, "path", { d: "M 0 -390 L 0 -200 M 0 -200 L -26 0 M 0 -200 L 26 0" });
      if (!armUp) K.node(g, "path", { d: `M 0 -350 L ${dir * 70} -270 L ${dir * 110} -300` });
      gsap.set(g, { x, y: 790 });
      return g;
    }
    const susan = figure(560, 1, false);
    const man = figure(1260, -1, true);
    const SH = [1260, 440]; // 남자 어깨
    const arm = K.node(svg, "line", Object.assign({ x1: SH[0], y1: SH[1] }, W));
    const head = K.node(svg, "rect", { width: 46, height: 30, rx: 4, fill: "#F2F2F2" });
    const arc = K.node(svg, "path", { fill: "none", stroke: "#E8202A", "stroke-width": 8, "stroke-linecap": "round" });
    const tip = K.node(svg, "path", { d: "M 0 0 L -26 -15 L -26 15 Z", fill: "#E8202A" });
    const S = { R: 300, a0: -40, a1: -215, p: 0 };
    tl.to(S, { p: 1, duration: 2.2, ease: "power2.inOut" }, 0.4);
    tl.to(susan, { x: 1040, duration: 1.6, ease: "power2.inOut" }, 3.2);
    tl.to(S, { R: 150, a1: -150, duration: 1.4, ease: "power2.inOut" }, 5.0);

    const far = K.div(stage, { left: "770px", top: "150px", color: "var(--white)", fontSize: "48px", fontWeight: "800" }, "멀 때");
    const near = K.div(stage, { left: "1030px", top: "180px", color: "var(--white)", fontSize: "48px", fontWeight: "800" }, "붙었을 때");
    K.inUp(tl, far, 3.0);
    tl.to(far, { opacity: 0, duration: 0.3 }, 5.0);
    K.inUp(tl, near, 6.0);
    K.hold(tl, 7);

    const rad = (d) => (d * Math.PI) / 180;
    const pt = (a, r) => [SH[0] + r * Math.cos(rad(a)), SH[1] + r * Math.sin(rad(a))];
    return () => {
      const end = S.a0 + (S.a1 - S.a0) * S.p;
      const [sx, sy] = pt(S.a0, S.R);
      const [ex, ey] = pt(end, S.R);
      const large = Math.abs(end - S.a0) > 180 ? 1 : 0;
      arc.setAttribute("d", S.p > 0.001 ? `M ${sx} ${sy} A ${S.R} ${S.R} 0 ${large} 0 ${ex} ${ey}` : "");
      tip.setAttribute("transform", `translate(${ex} ${ey}) rotate(${end - 90})`);
      tip.style.opacity = S.p > 0.05 ? 1 : 0;
      // 팔과 망치는 호의 시작점(치켜든 자세)
      const [hx, hy] = pt(S.a0, S.R * 0.62);
      arm.setAttribute("x2", hx); arm.setAttribute("y2", hy);
      head.setAttribute("transform", `translate(${hx} ${hy}) rotate(${S.a0}) translate(-23 -15)`);
    };
  },
};
