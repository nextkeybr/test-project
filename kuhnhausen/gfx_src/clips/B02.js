// B02 · L-B02_GFX_card_v1_911카드-등장 · T01 · 풀프레임 · 5초
window.CLIP = {
  file: "L-B02_GFX_card_v1_911카드-등장",
  format: "full",
  duration: 5,
  build(stage, tl) {
    const card = buildT01(stage, tl, {
      label: "911 녹취록 · 보도 인용",
      labelAt: 1.2,
      waveReveal: [0, 0.6],
      // 대사 앞 말줄임표는 원문 일부를 생략했다는 표시
      lines: [{ speaker: "신고자", text: "…침입자가 있어요.", at: 2.0 }],
      speech: [[2.0, 3.3]],
    });
    K.hold(tl, 5);
    return (t) => card.wave.draw(t);
  },
};
