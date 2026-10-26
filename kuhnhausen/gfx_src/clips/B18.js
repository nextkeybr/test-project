// B18 · L-B18_GFX_emphasis_v1_힘이-세네 · T08 · 오버레이 · 4초 · 1.2초 등장
window.CLIP = {
  file: "L-B18_GFX_emphasis_v1_힘이-세네",
  format: "overlay",
  duration: 4,
  build(stage, tl) {
    const el = buildT08(stage, tl, { text: "힘이 세네", at: 1.2 });
    tl.to(el, { opacity: 0, duration: 0.28, ease: "power2.in" }, 3.7);
    K.hold(tl, 4);
  },
};
