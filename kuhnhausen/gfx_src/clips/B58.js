// B58 · L-B58_GFX_bubble_v1_조사-진술변화 · 오버레이 · 7초 · 고정 라벨 "보도 인용"
// 말풍선 "모르는 사람이다" → 2.5초에 줄이 그어지고 새 말풍선
window.CLIP = {
  file: "L-B58_GFX_bubble_v1_조사-진술변화",
  format: "overlay",
  duration: 7,
  build(stage, tl) {
    const lab = K.label(stage, "보도 인용");
    K.inUp(tl, lab, 0.2, 0.35);
    const b1 = K.bubble(stage, "모르는 사람이다", { left: 880, top: 300 }, "left");
    K.pop(tl, b1, 0.4, 0.4, 0.9);
    const w = b1.getBoundingClientRect().width;
    const strike = K.div(b1, { left: "26px", top: "50%", marginTop: "-5px", width: w - 52 + "px", height: "10px",
      background: "var(--red)", transformOrigin: "left center" });
    gsap.set(strike, { scaleX: 0 });
    tl.to(strike, { scaleX: 1, duration: 0.35, ease: "power2.inOut" }, 2.5);
    tl.to(b1, { opacity: 0.6, duration: 0.3 }, 2.85);
    const b2 = K.bubble(stage, "아는 사이일 뿐, 내가 한 게 아니다", { left: 880, top: 470 }, "left");
    K.pop(tl, b2, 3.0, 0.4, 0.9);
    K.out(tl, [lab, b1, b2], 6.7);
    K.hold(tl, 7);
  },
};
