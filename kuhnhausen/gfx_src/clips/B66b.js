// B66 · L-B66_GFX_card-b_v1_징역10년 · T07 · 오버레이 · 5초 (등장 시각: timing.json "B66b")
window.CLIP = {
  file: "L-B66_GFX_card-b_v1_징역10년",
  format: "overlay",
  duration: 5,
  build(stage, tl) {
    const T = window.TIMING.B66b;
    buildT07(stage, tl, { pos: { left: 80, bottom: 220 }, big: { text: "징역 10년", at: T.big, dur: 0.5 },
      subs: [{ text: "2007년 9월 7일 · 선고", at: T.sub }] });
    K.hold(tl, 5);
  },
};
