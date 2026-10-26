// B30 · L-B30_GFX_hammer-c_v1_망치-수전에게 · T03 · 오버레이 · 4초 · 남자 → 0.6초 수전 → 유지
window.CLIP = {
  file: "L-B30_GFX_hammer-c_v1_망치-수전에게",
  format: "overlay",
  duration: 4,
  holdFrom: 1.0,
  build(stage, tl) {
    buildT03(stage, tl, { start: "man", moves: [{ to: "susan", at: 0.6 }] });
    K.hold(tl, 4);
  },
};
