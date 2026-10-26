// B27 · L-B27_GFX_emphasis_v1_증거를-남기다 · T08 · 오버레이 · 4초
window.CLIP = {
  file: "L-B27_GFX_emphasis_v1_증거를-남기다",
  format: "overlay",
  duration: 4,
  build(stage, tl) {
    const el = buildT08(stage, tl, { text: "자기 사건의 증거를 남기고 있었다", at: 0.4 });
    tl.to(el, { opacity: 0, duration: 0.28, ease: "power2.in" }, 3.7);
    K.hold(tl, 4);
  },
};
