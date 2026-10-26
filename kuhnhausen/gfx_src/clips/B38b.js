// B38-b · L-B38_GFX_label_v1_별거중인-남편 · T05(큰 라벨) · 오버레이 · 3초 · 남편 사진(RP-004) 위. 이름은 쓰지 않음
window.CLIP = {
  file: "L-B38_GFX_label_v1_별거중인-남편",
  format: "overlay",
  duration: 3,
  build(stage, tl) {
    const l = K.label(stage, "별거 중인 남편", { left: 80, top: 760 }, "big");
    K.inUp(tl, l, 0.3);
    K.out(tl, l, 2.7);
    K.hold(tl, 3);
  },
};
