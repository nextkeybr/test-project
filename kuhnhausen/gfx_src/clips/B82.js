// B82 · L-B82_GFX_quote_v2_싸워야-해요 · T10 · 오버레이(수전 사진 RP-002 위, 글자 뒤에만 블랙 50% 띠) · 14초
// 14초(홀드 포함). 인용 → 원문 → 끝에서 전체 페이드아웃. 시각은 timing.json "B82"
window.CLIP = {
  file: "L-B82_GFX_quote_v2_싸워야-해요",
  format: "overlay",
  duration: 14,
  build(stage, tl) {
    const T = window.TIMING.B82;
    buildT10(stage, tl, {
      quote: "도망칠 수도, 숨을 수도 없다면 싸워야 해요. 살아남지 못하리란 법은 없으니까요.",
      original: "If you can't run and you can't hide, you have to fight. You don't know that you won't survive.",
      label: "의역 · 2016 인터뷰",
      quoteAt: T.quote, originalAt: T.original, labelAt: T.label, centerY: 655, band: true, fadeOutAt: T.fadeOut, fadeOutDur: 1.0,
    });
    K.hold(tl, 14);
  },
};
