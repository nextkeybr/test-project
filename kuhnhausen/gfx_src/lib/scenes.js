// 여러 파일로 나뉜 장면(B15 a·b, B60 b1·b2·b3)이 정확히 이어지도록 같은 그림을 한 곳에서 만든다

// B15 망치 반경: mode 'a'(멀 때) | 'b'(붙었을 때, a의 끝 상태에서 시작)
window.sceneB15 = function (stage, tl, mode) {
  const svg = K.svg(stage);
  const W = { stroke: "#F2F2F2", "stroke-width": 6, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" };
  // 사람(옆모습): x, 얼굴 방향 dir(-1 왼쪽, 1 오른쪽)
  function figure(x, dir, armUp) {
    const g = K.node(svg, "g", Object.assign({}, W));
    K.node(g, "circle", { cx: 0, cy: -430, r: 38 });
    K.node(g, "path", { d: "M 0 -390 L 0 -200 M 0 -200 L -26 0 M 0 -200 L 26 0" });
    if (!armUp) K.node(g, "path", { d: `M 0 -350 L ${dir * 70} -270 L ${dir * 110} -300` });
    gsap.set(g, { x, y: 790 });
    return g;
  }
  const FAR_X = 560, NEAR_X = 1040;
  const susan = figure(mode === "a" ? FAR_X : FAR_X, 1, false);
  figure(1260, -1, true);
  const SH = [1260, 440]; // 남자 어깨
  const arm = K.node(svg, "line", Object.assign({ x1: SH[0], y1: SH[1] }, W));
  const head = K.node(svg, "rect", { width: 46, height: 30, rx: 4, fill: "#F2F2F2" });
  const arc = K.node(svg, "path", { fill: "none", stroke: "#E8202A", "stroke-width": 8, "stroke-linecap": "round" });
  const tip = K.node(svg, "path", { d: "M 0 0 L -26 -15 L -26 15 Z", fill: "#E8202A" });
  const far = K.div(stage, { left: "770px", top: "150px", color: "var(--white)", fontSize: "48px", fontWeight: "800" }, "멀 때");
  const near = K.div(stage, { left: "1030px", top: "180px", color: "var(--white)", fontSize: "48px", fontWeight: "800" }, "붙었을 때");
  const S = { R: 300, a0: -40, a1: -215, p: 0 };
  if (mode === "a") {
    // 큰 호가 그려짐 → 3초 "멀 때" → 끝까지 정지
    tl.to(S, { p: 1, duration: 2.2, ease: "power2.inOut" }, 0.4);
    K.inUp(tl, far, 3.0);
    gsap.set(near, { opacity: 0 });
  } else {
    // a의 끝 상태에서 시작: 0.5~2초 수전이 다가감 → 2~3.5초 호가 작게 → 3초 "붙었을 때"
    S.p = 1;
    tl.to(susan, { x: NEAR_X, duration: 1.5, ease: "power2.inOut" }, 0.5);
    tl.to(far, { opacity: 0, duration: 0.3 }, 2.0);
    tl.to(S, { R: 150, a1: -150, duration: 1.5, ease: "power2.inOut" }, 2.0);
    K.inUp(tl, near, 3.0);
  }
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
    const [hx, hy] = pt(S.a0, S.R * 0.62);
    arm.setAttribute("x2", hx); arm.setAttribute("y2", hy);
    head.setAttribute("transform", `translate(${hx} ${hy}) rotate(${S.a0}) translate(-23 -15)`);
  };
};

// B60 타임라인: part 'b1'(1991 클로즈업) | 'b2'(1994 클로즈업, 막대 시작) | 'b3'(줌아웃, 2003 + 9년 복역)
// 앞 사건 피해자의 이름은 넣지 않는다
window.sceneB60 = function (stage, tl, part, T) {
  const world = K.div(stage, { left: "0px", top: "0px", width: "1920px", height: "1080px", transformOrigin: "0 0" });
  K.bottomMask(stage);
  const X = (y) => 200 + (y - 1990) * (1520 / 15);
  const Y = 520;
  const cam = (s, cx, cy) => ({ x: 960 - cx * s, y: 450 - cy * s, scale: s });
  const t = buildTimeline(world, tl, { y: Y, x1: 160, x2: 1760, lineAt: part === "b1" ? 0 : null });
  const bar = t.bar(null, X(1994), X(2003), "9년 복역");
  gsap.set(bar.b, { scaleX: 0 });
  gsap.set(bar.l, { opacity: 0 });
  const BAR_B2_END = 0.3; // b2 끝에서 막대가 뻗어 있는 비율(b3가 여기서 이어감)
  if (part === "b1") {
    gsap.set(world, cam(2.2, X(1991) + 80, Y - 30));
    t.add({ x: X(1991), label: "1991 · 살해 계획", at: T.point1991 });
    tl.to(world, Object.assign(cam(2.35, X(1991) + 80, Y - 30), { duration: 4, ease: "none" }), 0);
  } else if (part === "b2") {
    t.add({ x: X(1991), label: "1991 · 살해 계획" });
    gsap.set(world, cam(2.2, X(1994), Y));
    t.add({ x: X(1994), label: "1994 · 유죄 인정", at: T.point1994, below: true });
    tl.to(bar.b, { scaleX: BAR_B2_END, duration: 4 - T.barStart, ease: "none" }, T.barStart);
    tl.to(world, Object.assign(cam(2.2, X(1994) + 160, Y), { duration: 4 - T.barStart, ease: "none" }), T.barStart);
  } else {
    t.add({ x: X(1991), label: "1991 · 살해 계획" });
    t.add({ x: X(1994), label: "1994 · 유죄 인정", below: true });
    gsap.set(world, cam(2.2, X(1994) + 160, Y));
    gsap.set(bar.b, { scaleX: BAR_B2_END });
    tl.to(world, Object.assign(cam(1, 960, 460), { duration: 1.5, ease: "power2.inOut" }), 0);
    tl.to(bar.b, { scaleX: 1, duration: 1.6, ease: "power1.inOut" }, 0);
    t.add({ x: X(2003), label: "2003 · 출소", at: T.point2003 });
    K.inUp(tl, bar.l, T.barLabel);
  }
  return t;
};

// B24 빈 증거 카드 두 장(글자 없음). 카메라로 클로즈업·줌아웃
window.sceneB24 = function (stage) {
  const world = K.div(stage, { left: "0px", top: "0px", width: "1920px", height: "1080px", transformOrigin: "0 0" });
  K.bottomMask(stage);
  const cards = [560, 1060].map((x) => {
    const c = K.div(world, { left: x + "px", top: "330px", width: "300px", height: "220px", background: "var(--black)",
      border: "3px solid var(--white)" });
    K.div(c, { left: "136px", top: "-17px", width: "28px", height: "28px", borderRadius: "50%", background: "var(--yellow)" });
    c._cx = x + 150; c._cy = 440;
    return c;
  });
  const camAt = (c, s) => ({ x: 960 - c._cx * s, y: 450 - c._cy * s, scale: s });
  return {
    world, cards, camAt,
    camWide: () => ({ x: 0, y: 0, scale: 1 }),
    cam(c, s) { gsap.set(world, camAt(c, s)); },
    rise(tl, c, at, dur) {
      gsap.set(c, { opacity: 0, y: 60 });
      tl.to(c, { opacity: 1, duration: 0.6, ease: "power1.out" }, at);
      tl.to(c, { y: 0, duration: dur, ease: "power2.out" }, at);
    },
  };
};
