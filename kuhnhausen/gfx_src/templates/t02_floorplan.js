// T02 집 평면도: 위에서 내려다보고 25도 기울인 2.5D 단층집 (설명용, 실제 구조 아님)
// 좌표는 평면 좌표(px, py)로 다루고 proj()로 화면(월드) 좌표로 바꾼다.
// buildT02(stage, tl, cfg) -> api
//   cfg.drawAt     선이 그려지기 시작하는 시각(없으면 처음부터 다 그려진 상태)
//   cfg.cam        시작 카메라 {s, cx, cy}  (cx, cy는 평면 좌표)
//   api.person(key, name, at, plan)          인물 점 + 이름표
//   api.move(tl, key, points, at, dur)       점을 평면 좌표 경로로 이동
//   api.path(tl, points, at, dur, opts)      옐로우 경로선
//   api.cam(tl, at, dur, {s, cx, cy})        카메라 이동/줌
//   api.neighbor(tl, at), api.body(tl, at), api.arrow(tl, points, at)
(function () {
  const TILT = 25 * Math.PI / 180;
  const C = Math.cos(TILT), WH = 60 * Math.sin(TILT);
  const OX = 410, OY = 160;
  const proj = ([x, y]) => [OX + x, OY + y * C];

  const WALLS = [
    [0, 0, 60, 0], [140, 0, 1100, 0],                 // 뒤쪽(뒷문 60~140)
    [1100, 0, 1100, 640], [0, 0, 0, 640],
    [0, 640, 100, 640], [200, 640, 1100, 640],         // 앞쪽(현관문 100~200)
    [0, 260, 250, 260], [320, 260, 380, 260], [520, 260, 600, 260], [690, 260, 1100, 260],
    [0, 380, 60, 380], [260, 380, 700, 380], [800, 380, 1100, 380],
    [340, 0, 340, 260], [560, 0, 560, 260], [300, 380, 300, 640],
  ];
  const ROOMS = [
    ["뒷문 쪽 작은 방", 170, 130], ["지하실 계단", 450, 130], ["침실", 950, 90], ["복도", 930, 320], ["현관", 150, 510],
  ];
  const NEIGHBOR = [[1340, 40], [1960, 40], [1960, 600], [1340, 600]];

  window.T02_ROOMS = { bedroomDoor: [645, 260], bedroom: [830, 130], hall: [550, 320] };

  window.buildT02 = function (stage, tl, cfg = {}) {
    const world = K.div(stage, { left: "0px", top: "0px", width: "1920px", height: "1080px", transformOrigin: "0 0" });
    K.bottomMask(stage);
    const svg = K.svg(world);
    const walls = K.node(svg, "g");
    const extra = K.node(svg, "g");
    const top = K.node(svg, "g");
    const drawAt = cfg.drawAt;

    // 계단 표시
    for (let y = 30; y <= 240; y += 30) {
      const [a, b] = [proj([380, y]), proj([520, y])];
      const l = K.node(walls, "line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#F2F2F2", "stroke-opacity": 0.35, "stroke-width": 2 });
      if (drawAt != null) { gsap.set(l, { opacity: 0 }); tl.to(l, { opacity: 1, duration: 0.3 }, drawAt + 0.6 + y / 1000); }
    }
    // 벽: 바닥선 + 옅은 면 + 윗선(3px)
    WALLS.forEach((w, i) => {
      const [a, b] = [proj([w[0], w[1]]), proj([w[2], w[3]])];
      const face = K.node(walls, "polygon", { points: `${a[0]},${a[1]} ${b[0]},${b[1]} ${b[0]},${b[1] - WH} ${a[0]},${a[1] - WH}`,
        fill: "#F2F2F2", "fill-opacity": 0.07, stroke: "#F2F2F2", "stroke-opacity": 0.3, "stroke-width": 2 });
      const line = K.node(walls, "line", { x1: a[0], y1: a[1] - WH, x2: b[0], y2: b[1] - WH, stroke: "#F2F2F2", "stroke-width": 3, "stroke-linecap": "square" });
      if (drawAt != null) {
        gsap.set(face, { opacity: 0 });
        tl.to(face, { opacity: 1, duration: 0.4 }, drawAt + 0.45 + i * 0.02);
        K.draw(tl, line, drawAt + i * 0.03, 0.5);
      }
    });
    // 방 이름
    const labels = ROOMS.map(([name, x, y], i) => {
      const [wx, wy] = proj([x, y]);
      const l = K.div(world, { left: wx + "px", top: wy + "px", color: "var(--white)", fontSize: "30px", fontWeight: "700",
        background: "var(--black)", padding: "4px 10px 6px", whiteSpace: "nowrap", lineHeight: "1" }, name);
      gsap.set(l, { xPercent: -50, yPercent: -50 });
      if (drawAt != null) K.inUp(tl, l, drawAt + 0.6 + i * 0.05, 0.35);
      return l;
    });
    // 고정 라벨
    const tag = K.label(stage, "설명용 평면도", { left: 80, top: 816 });
    if (drawAt != null) K.inUp(tl, tag, drawAt + 0.6, 0.35);

    const people = {};
    const camState = Object.assign({ s: 1, cx: 550, cy: 320 }, cfg.cam || {});
    function camXY(c) {
      const [wx, wy] = proj([c.cx, c.cy]);
      return { x: 960 - wx * c.s, y: 450 - wy * c.s, scale: c.s };
    }
    gsap.set(world, camXY(camState));

    const api = {
      world, svg, proj, labels,
      cam(tl, at, dur, c) { tl.to(world, Object.assign(camXY(c), { duration: dur, ease: "power2.inOut" }), at); },
      person(key, name, at, plan) {
        const susan = key === "susan";
        const p = K.div(world, { left: "0px", top: "0px", width: "0px", height: "0px", zIndex: 5 });
        K.div(p, { left: "-17px", top: "-17px", width: "34px", height: "34px", borderRadius: "50%",
          background: susan ? "var(--yellow)" : "var(--white)", border: "3px solid var(--black)" });
        K.div(p, Object.assign({ left: "0px", top: "-74px", fontSize: "30px", fontWeight: "800", lineHeight: "1",
          padding: "6px 12px 8px", whiteSpace: "nowrap", transform: "translateX(-50%)" },
          susan ? { background: "var(--yellow)", color: "var(--black)" }
                : { background: "var(--black)", color: "var(--white)", border: "2px solid var(--white)" }), name);
        const [wx, wy] = proj(plan);
        gsap.set(p, { x: wx, y: wy });
        if (at != null) { gsap.set(p, { opacity: 0, scale: 0.6 }); tl.to(p, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, at); }
        people[key] = p;
        return p;
      },
      move(tl, key, points, at, dur, ease = "power2.inOut") {
        const seg = dur / points.length;
        points.forEach((pt, i) => {
          const [wx, wy] = proj(pt);
          tl.to(people[key], { x: wx, y: wy, duration: seg, ease: points.length > 1 ? "none" : ease }, at + i * seg);
        });
      },
      path(tl, points, at, dur, opts = {}) {
        const d = points.map((p, i) => (i ? "L" : "M") + proj(p).join(" ")).join(" ");
        const pth = K.node(extra, "path", { d, fill: "none", stroke: opts.color || "#FFD400", "stroke-width": opts.width || 7,
          "stroke-linecap": "round", "stroke-linejoin": "round" });
        if (dur > 0) K.draw(tl, pth, at, dur, "none");
        return pth;
      },
      neighbor(tl, at) {
        const pts = NEIGHBOR.map((p) => proj(p));
        const g = K.node(walls, "g");
        K.node(g, "polygon", { points: pts.map((p) => p.join(",")).join(" "), fill: "none", stroke: "#F2F2F2",
          "stroke-width": 3, "stroke-dasharray": "16 12", "stroke-opacity": 0.8 });
        K.node(g, "polygon", { points: pts.map((p) => `${p[0]},${p[1] - WH}`).join(" "), fill: "none", stroke: "#F2F2F2",
          "stroke-width": 2, "stroke-dasharray": "16 12", "stroke-opacity": 0.35 });
        const [lx, ly] = proj([1650, 320]);
        const l = K.div(world, { left: lx + "px", top: ly + "px", color: "var(--white)", fontSize: "30px", fontWeight: "700",
          background: "var(--black)", padding: "4px 10px 6px", lineHeight: "1" }, "옆집");
        gsap.set(l, { xPercent: -50, yPercent: -50 });
        if (at != null) { gsap.set([g, l], { opacity: 0 }); tl.to([g, l], { opacity: 1, duration: 0.5 }, at); }
      },
      // 시신 표시: 레드 사람 윤곽(누운 형태, 디테일 없음), 라벨 없음
      body(tl, at, plan = [600, 322]) {
        const [x, y] = proj(plan);
        const g = K.node(extra, "g", { transform: `translate(${x} ${y}) scale(1 ${C})`, fill: "#E8202A" });
        K.node(g, "circle", { cx: 0, cy: 0, r: 19 });
        K.node(g, "rect", { x: 22, y: -20, width: 96, height: 40, rx: 16 });
        K.node(g, "rect", { x: 112, y: -18, width: 96, height: 16, rx: 8 });
        K.node(g, "rect", { x: 112, y: 2, width: 96, height: 16, rx: 8 });
        K.node(g, "rect", { x: 30, y: -34, width: 70, height: 13, rx: 6, transform: "rotate(-8 30 -28)" });
        K.node(g, "rect", { x: 30, y: 22, width: 70, height: 13, rx: 6, transform: "rotate(8 30 28)" });
        if (at != null) { gsap.set(g, { opacity: 0 }); tl.to(g, { opacity: 1, duration: 0.8, ease: "power1.inOut" }, at); }
        return g;
      },
      arrow(tl, points, at, dur = 0.6) {
        const pth = api.path(tl, points, at, dur, { color: "#F2F2F2", width: 7 });
        const [a, b] = [proj(points[points.length - 2]), proj(points[points.length - 1])];
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
        const head = K.node(extra, "path", { d: "M 0 0 L -30 -17 L -30 17 Z", fill: "#F2F2F2",
          transform: `translate(${b[0]} ${b[1]}) rotate(${ang})` });
        gsap.set(head, { opacity: 0 });
        tl.to(head, { opacity: 1, duration: 0.12 }, at + dur - 0.1);
        return pth;
      },
    };
    return api;
  };
})();
