// B02 · L-B02_GFX_card_v2_911카드-등장 · T01 · 풀프레임 · 5초 (등장 시각: timing.json "B02")
window.CLIP = {
  file: "L-B02_GFX_card_v2_911카드-등장",
  format: "full",
  duration: 5,
  build(stage, tl) {
    const T = window.TIMING.B02;
    const card = buildT01(stage, tl, {
      label: "911 녹취록 · 보도 인용",
      labelAt: T.label,
      waveReveal: [T.waveReveal, 0.6],
      // 대사 앞 말줄임표는 원문 일부를 생략했다는 표시
      lines: [{ speaker: "신고자", text: "…침입자가 있어요.", at: T.line1 }],
    });
    K.hold(tl, 5);
    return (t) => card.wave.draw(t);
  },
};
