// B39 · L-B39_GFX_label_v1_강제침입-흔적없음 · T05 · 오버레이 · 5초 · "강제 침입 흔적 없음" + 옆에 작은 라벨 "보도 인용"
window.CLIP = {
  file: "L-B39_GFX_label_v1_강제침입-흔적없음",
  format: "overlay",
  duration: 5,
  build(stage, tl) {
    const big = K.label(stage, "강제 침입 흔적 없음", { left: 80, top: 760 }, "big");
    const w = big.getBoundingClientRect().width;
    const small = K.label(stage, "보도 인용", { left: 80 + w + 16, top: 792 });
    K.inUp(tl, big, 0.3);
    K.inUp(tl, small, 0.6, 0.35);
    K.out(tl, [big, small], 4.7);
    K.hold(tl, 5);
  },
};
