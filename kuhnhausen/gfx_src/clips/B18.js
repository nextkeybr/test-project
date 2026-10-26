// B18 · L-B18_GFX_emphasis_v2_힘이-세네 · T08 · 오버레이 · 4초 · 1.2초 등장
window.CLIP = {
  file: "L-B18_GFX_emphasis_v2_힘이-세네",
  format: "overlay",
  duration: 4,
  build(stage, tl) {
    buildT08(stage, tl, { text: "힘이 세네", at: 1.2 });
    K.hold(tl, 4);
  },
};
