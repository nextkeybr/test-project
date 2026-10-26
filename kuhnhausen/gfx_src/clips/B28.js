// B28 · L-B28_GFX_floorplan-c_v2_전체동선-14분 · T02 · 풀프레임 · 5초
// 집 전체. 침실 → 복도 동선을 옐로우 선으로 한 번에. 위쪽 가로 막대가 차오르고 끝에 "약 14분"
// 초 단위로 흐르는 시계 숫자는 쓰지 않는다
window.CLIP = {
  file: "L-B28_GFX_floorplan-c_v2_전체동선-14분",
  format: "full",
  duration: 5,
  build(stage, tl) {
    const fp = buildT02(stage, tl, { cam: { s: 0.92, cx: 550, cy: 340 } });
    fp.path(tl, [[830, 150], [700, 210], [645, 260], [600, 320], [420, 322], [250, 320]], 0.4, 1.6);
    const track = K.div(stage, { left: "420px", top: "84px", width: "900px", height: "16px", background: "rgba(242,242,242,0.18)" });
    const fill = K.div(track, { left: "0px", top: "0px", width: "900px", height: "16px", background: "var(--yellow)", transformOrigin: "left center" });
    gsap.set(fill, { scaleX: 0 });
    tl.to(fill, { scaleX: 1, duration: 3.4, ease: "none" }, 0.5);
    const lab = K.div(stage, { left: "1346px", top: "66px", color: "var(--yellow)", fontSize: "48px", fontWeight: "800", lineHeight: "1" }, "약 14분");
    K.inUp(tl, lab, 3.9, 0.35);
    K.hold(tl, 5);
  },
};
