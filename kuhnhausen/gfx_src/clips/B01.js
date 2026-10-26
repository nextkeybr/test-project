// B01 · L-B01_GFX_card_v2_날짜-장소 · T07 · 풀프레임 · 4초
window.CLIP = {
  file: "L-B01_GFX_card_v2_날짜-장소",
  format: "full",
  duration: 4,
  build(stage, tl) {
    buildT07(stage, tl, {
      pos: "center", centerY: 450,
      big: { text: "2006년 9월", at: 0.4, dur: 0.8 },
      subs: [{ text: "미국 오리건주 포틀랜드", at: 1.4, dur: 0.7 }],
    });
    K.hold(tl, 4); // 퇴장 없이 컷용으로 정지
  },
};
