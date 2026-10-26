// B33 · L-B33_GFX_card_v1_해피-인물카드 · T06 · 오버레이 · 6초
window.CLIP = {
  file: "L-B33_GFX_card_v1_해피-인물카드",
  format: "overlay",
  duration: 6,
  build(stage, tl) {
    buildT06(stage, tl, { name: "에드워드 해피", info: "59세 · 전과 여러 번", inAt: 0.5, outAt: 5.4 });
    K.hold(tl, 6);
  },
};
