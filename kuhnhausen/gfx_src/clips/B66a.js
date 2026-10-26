// B66 · L-B66_GFX_card-a_v1_유죄인정 · T07 · 오버레이 · 5초 (기존 판결카드 9초 1개를 a·b로 분리. 등장 시각: timing.json "B66a")
window.CLIP = {
  file: "L-B66_GFX_card-a_v1_유죄인정",
  format: "overlay",
  duration: 5,
  build(stage, tl) {
    const T = window.TIMING.B66a;
    buildT07(stage, tl, { pos: { left: 80, bottom: 220 }, subs: [{ text: "2007년 8월 30일 · 유죄 인정", at: T.sub }] });
    K.hold(tl, 5);
  },
};
