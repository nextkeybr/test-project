// B02 · L-B02_GFX_card-b_v1_911카드-파형클로즈업 · T01 · 풀프레임 · 3초
// B02 카드에서 파형만 화면 가득(가로 1800px, 세로 진폭 2배). 라벨은 그대로, 대화 줄은 없음. 0~3초 계속 움직임
window.CLIP = {
  file: "L-B02_GFX_card-b_v1_911카드-파형클로즈업",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const card = buildT01(stage, tl, {
      label: "911 녹취록 · 보도 인용",
      lines: [],
      wave: { w: 1800, h: 300, y: 300 },
      speech: [[-8, -6.4], [-5.9, -3.6], [-3.1, -1.2], [-0.7, 1.4], [1.8, 3.4]],
    });
    K.hold(tl, 3);
    return (t) => card.wave.draw(t);
  },
};
