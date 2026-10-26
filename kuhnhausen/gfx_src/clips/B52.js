// B52 · L-B52_GFX_emphasis_v1_마이크에게-전화 · T08 · 오버레이 · 3초
window.CLIP = {
  file: "L-B52_GFX_emphasis_v1_마이크에게-전화",
  format: "overlay",
  duration: 3,
  build(stage, tl) {
    const el = buildT08(stage, tl, { text: "마이크에게 전화", at: 0.3 });
    tl.to(el, { opacity: 0, duration: 0.28, ease: "power2.in" }, 2.7);
    K.hold(tl, 3);
  },
};
