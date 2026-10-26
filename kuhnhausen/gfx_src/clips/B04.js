// B04 · L-B04_GFX_card_v3_911카드-대화2 · T01 + T08 · 풀프레임 · 10초 (등장 시각: timing.json "B04")
// v2: 줄5 구절에 레드 밑줄 → 강조 자막으로 연결 / v3: 10초, 끝 정지 꼬리, 시각을 설정값으로
window.CLIP = {
  file: "L-B04_GFX_card_v3_911카드-대화2",
  format: "full",
  duration: 10,
  build(stage, tl) {
    const T = window.TIMING.B04;
    const card = buildT01(stage, tl, {
      label: "911 녹취록 · 보도 인용",
      // B03 끝 상태에서 이어짐: 줄1·2는 옅게, 줄3은 진하게
      lines: [
        { speaker: "신고자", text: "…침입자가 있어요.", state: "shown", opacity: 0.6 },
        { speaker: "상담원", text: "그분 바꿔 줄 수 있나요?", state: "shown", opacity: 0.6 },
        { speaker: "신고자", text: "그 사람, 피를 흘리고 있어요.", state: "shown", opacity: 1 },
        { speaker: "상담원", text: "구급차가 필요한가요?", at: T.line4 },
        { speaker: "신고자", text: "아니요, 그 사람 간호사예요. 구급차는 그 남자한테 불러 달래요. 죽었을지도 모른대요.", at: T.line5,
          mark: { text: "구급차는 그 남자한테", at: T.underline } },
      ],
      extraSpeech: [[-6, -4.6], [-3.8, -1.2]],
      flatAt: T.waveStop,
    });
    // 강조가 뜨면 대화 줄은 뒤로 물러남
    tl.to(card.list, { opacity: 0.28, duration: 0.4, ease: "power2.out" }, T.emphasis);
    buildT08(stage, tl, { text: "구급차는 그 남자한테", at: T.emphasis, centerY: 540 });
    K.hold(tl, 10);
    return (t) => card.wave.draw(t);
  },
};
