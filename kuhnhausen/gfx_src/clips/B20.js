// B20 · L-B20_GFX_hammer-b_v2_망치-남자에게 · T03 · 오버레이 · 5초
// 남자 → 0.8초 수전(휩팬 타이밍, 0.25초) → 2.6초 다시 남자(0.25초)
window.CLIP = {
  file: "L-B20_GFX_hammer-b_v2_망치-남자에게",
  format: "overlay",
  duration: 5,
  holdFrom: 3.0,
  build(stage, tl) {
    buildT03(stage, tl, { start: "man", moves: [{ to: "susan", at: 0.8 }, { to: "man", at: 2.6 }] });
    K.hold(tl, 5);
  },
};
