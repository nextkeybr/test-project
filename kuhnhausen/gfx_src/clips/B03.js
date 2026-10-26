// B03 · L-B03_GFX_card_v1_911카드-대화1 · T01 · 오버레이(재생성 영상과 교차 편집) · 7초
window.CLIP = {
  file: "L-B03_GFX_card_v1_911카드-대화1",
  format: "overlay",
  duration: 7,
  build(stage, tl) {
    // B02의 마지막 상태에서 시작
    const card = buildT01(stage, tl, {
      label: "911 녹취록 · 보도 인용",
      lines: [
        { speaker: "신고자", text: "…침입자가 있어요.", state: "shown" },
        { speaker: "상담원", text: "그분 바꿔 줄 수 있나요?", at: 1.0 },
        { speaker: "신고자", text: "그 사람, 피를 흘리고 있어요.", at: 3.5 },
      ],
      speech: [[-3.0, -1.7], [1.0, 2.4], [3.5, 5.0]],
    });
    K.hold(tl, 7);
    return (t) => card.wave.draw(t);
  },
};
