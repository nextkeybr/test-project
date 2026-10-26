// B66 · L-B66_GFX_card_v1_판결카드 · T07 · 오버레이 · 9초 (법정 영상 위)
// 1.0초 보조 첫 줄, 4.0초 보조 둘째 줄, 5.0초 큰 글자
window.CLIP = {
  file: "L-B66_GFX_card_v1_판결카드",
  format: "overlay",
  duration: 9,
  build(stage, tl) {
    buildT07(stage, tl, {
      pos: { left: 80, bottom: 220 },
      big: { text: "징역 10년", at: 5.0, dur: 0.5 },
      subs: [{ text: "2007년 8월 30일 · 유죄 인정", at: 1.0 }, { text: "2007년 9월 7일 · 선고", at: 4.0 }],
      outAt: 8.7,
    });
    K.hold(tl, 9);
  },
};
