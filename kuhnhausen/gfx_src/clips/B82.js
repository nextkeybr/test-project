// B82 · L-B82_GFX_quote_v1_싸워야-해요 · T10 · 오버레이(수전 사진 RP-002 위, 글자 뒤에만 블랙 50% 띠) · 10초
// 2.0초 인용 → 6.0초 원문 → 9.0초부터 전체 페이드아웃
window.CLIP = {
  file: "L-B82_GFX_quote_v1_싸워야-해요",
  format: "overlay",
  duration: 10,
  build(stage, tl) {
    buildT10(stage, tl, {
      quote: "도망칠 수도, 숨을 수도 없다면 싸워야 해요. 살아남지 못하리란 법은 없으니까요.",
      original: "If you can't run and you can't hide, you have to fight. You don't know that you won't survive.",
      label: "의역 · 2016 인터뷰",
      quoteAt: 2.0, originalAt: 6.0, labelAt: 6.3, centerY: 655, band: true, fadeOutAt: 9.0, fadeOutDur: 1.0,
    });
    K.hold(tl, 10);
  },
};
