// B69 · L-B69_GFX_card_v1_배상-목적 · T07 · 풀프레임 · 4초
// 영어 원문을 확인하지 않았으므로 T10 인용 카드(원문 줄)가 아니라 T07 정보 카드로
window.CLIP = {
  file: "L-B69_GFX_card_v1_배상-목적",
  format: "full",
  duration: 4,
  build(stage, tl) {
    buildT07(stage, tl, { pos: "center", centerY: 450, big: { text: "다시는 돈으로 사지 못하게", at: 0.4, dur: 0.8 },
      subs: [{ text: "민사 배상의 이유 · 수전의 말(보도)", at: 1.4, dur: 0.6 }] });
    K.hold(tl, 4);
  },
};
