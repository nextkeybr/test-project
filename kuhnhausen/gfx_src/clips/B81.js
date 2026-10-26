// B81 · L-B81_GFX_quote_v2_살려고-한-거예요 · T10 · 풀프레임 카드 · 5초 (등장 시각: timing.json "B81")
window.CLIP = {
  file: "L-B81_GFX_quote_v2_살려고-한-거예요",
  format: "full",
  duration: 5,
  build(stage, tl) {
    const T = window.TIMING.B81;
    buildT10(stage, tl, {
      quote: "그 사람을 죽이려고 한 게 아니에요. 살려고 한 거예요.",
      original: "I didn't choose his death. I chose my life.",
      label: "의역 · 2016 인터뷰",
      quoteAt: T.quote, originalAt: T.original, labelAt: T.label, centerY: 460,
    });
    K.hold(tl, 5);
  },
};
