// B73 · L-B73_GFX_map-c2_v1_귀환금지-도장 · T11 · 풀프레임 · 3초
// B73 지도(빨갛게 잠긴 멀트노마 카운티 경계) 위에 옐로우 도장 "이 지역으로 돌아올 수 없게"
window.CLIP = {
  file: "L-B73_GFX_map-c2_v1_귀환금지-도장",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const m = buildT11(stage, tl, { cam: { s: 4.6, lat: 45.45, lon: -122.55 }, showCounties: true });
    const mult = m.county("41051");
    mult.a = 1; mult.w = 7;
    const lock = K.div(stage, { width: "64px", height: "92px", zIndex: 5 });
    K.div(lock, { left: "14px", top: "0px", width: "36px", height: "46px", border: "8px solid var(--white)", borderBottom: "none",
      borderRadius: "22px 22px 0 0" });
    const body = K.div(lock, { left: "0px", top: "38px", width: "64px", height: "54px", background: "var(--red)", border: "3px solid var(--white)" });
    K.div(body, { left: "24px", top: "14px", width: "10px", height: "18px", borderRadius: "5px", background: "var(--white)" });
    m.pinTo(lock, 45.56, -122.4, -32, -60);
    const st = K.div(stage, { zIndex: 6 });
    const inner = K.div(st, { left: "0px", top: "0px", background: "var(--yellow)", color: "var(--black)", fontSize: "60px",
      fontWeight: "800", lineHeight: "1", padding: "22px 36px 26px", border: "6px solid var(--black)", outline: "6px solid var(--yellow)",
      whiteSpace: "nowrap" }, "이 지역으로 돌아올 수 없게");
    m.pinTo(st, 45.56, -122.4, 0, 120);
    gsap.set(inner, { xPercent: -50, rotation: -6, scale: 1.6, opacity: 0 });
    tl.to(inner, { opacity: 1, duration: 0.06 }, 0.6);
    tl.to(inner, { scale: 1, duration: 0.14, ease: "power4.in" }, 0.6);
    [[-6, 5], [4, -3], [-2, 2], [0, 0]].forEach(([x, y], i) => tl.to(inner, { x, y, duration: 0.04 }, 0.74 + i * 0.04));
    K.hold(tl, 3);
    return () => m.draw();
  },
};
