// B47 · L-B47_GFX_bubble_v2_인정과-부인 · 오버레이 · 7초 (남편 사진 RP-004 옆) · 고정 라벨 "당사자 주장"
window.CLIP = {
  file: "L-B47_GFX_bubble_v2_인정과-부인",
  format: "overlay",
  duration: 7,
  build(stage, tl) {
    const lab = K.label(stage, "당사자 주장");
    K.inUp(tl, lab, 0.2, 0.35);
    const b1 = K.bubble(stage, "경보는 내가 껐다", { left: 1000, top: 300 }, "left");
    const b2 = K.bubble(stage, "그 남자는 안 들였다", { left: 1000, top: 470 }, "left");
    K.pop(tl, b1, 0.5, 0.4, 0.9);
    K.pop(tl, b2, 2.5, 0.4, 0.9);
    K.hold(tl, 7);
  },
};
