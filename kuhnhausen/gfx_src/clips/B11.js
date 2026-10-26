// B11 · L-B11_GFX_label_v1_오후-6시-37분 · T07(작게, 큰 글자 56px) · 오버레이 · 6초 · 왼쪽 아래(말자막 위)
window.CLIP = {
  file: "L-B11_GFX_label_v1_오후-6시-37분",
  format: "overlay",
  duration: 6,
  build(stage, tl) {
    buildT07(stage, tl, { pos: { left: 80, bottom: 220 }, bigSize: 56, big: { text: "오후 6시 37분", at: 0.5, dur: 0.6 }, outAt: 5.7 });
    K.hold(tl, 6);
  },
};
