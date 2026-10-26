// B07 · L-B07_GFX_card_v2_수전-인물카드 · T06 · 오버레이 · 7초
window.CLIP = {
  file: "L-B07_GFX_card_v2_수전-인물카드",
  format: "overlay",
  duration: 7,
  build(stage, tl) {
    buildT06(stage, tl, { name: "수전 쿤하우젠", info: "51세 · 응급실 간호사", inAt: 0.5, outAt: 6.4 });
    tl.set({}, {}, 7); // 타임라인 길이를 7초로 고정
  },
};
