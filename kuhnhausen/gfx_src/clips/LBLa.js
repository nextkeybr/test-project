// 공용 라벨 · L-LBL_GFX_label-a_v1_재연 · T05 · 오버레이 · 30초 (편집에서 잘라 씀, 퇴장 없음)
window.CLIP = {
  file: "L-LBL_GFX_label-a_v1_재연",
  format: "overlay",
  duration: 30,
  holdFrom: 0.5,
  build(stage, tl) {
    K.inUp(tl, K.label(stage, "재연"), 0, 0.35);
    K.hold(tl, 30);
  },
};
