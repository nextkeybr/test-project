// B25 · L-B25_GFX_card_v2_이빨자국 · 오버레이 · 6초 · 화면 오른쪽 위 1/4
window.CLIP = {
  file: "L-B25_GFX_card_v2_이빨자국",
  format: "overlay",
  duration: 6,
  build(stage, tl) {
    const c = window.evCard(stage, { left: 1380, top: 150, width: 460 }, "이빨 자국 → 범인");
    window.evCardIn(tl, c, 0.4);
    K.hold(tl, 6);
  },
};
