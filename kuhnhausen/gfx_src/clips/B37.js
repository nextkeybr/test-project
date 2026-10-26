// B37 · L-B37_GFX_card_v2_911카드-가려진줄 · T01 · 풀프레임 · 5초 (등장 시각: timing.json "B37")
// 지금까지의 대화 중 뒷부분 세 줄을 옅게 두고(B31-a에서 신고자가 '이웃'으로 밝혀졌으므로 이름표는 '이웃'),
// 새 줄 하나를 흐리게(읽을 수 없게) 올린다. 4.6초에 파형과 함께 뚝 정지
window.CLIP = {
  file: "L-B37_GFX_card_v2_911카드-가려진줄",
  format: "full",
  duration: 5,
  build(stage, tl) {
    const T = window.TIMING.B37;
    const card = buildT01(stage, tl, {
      label: "911 녹취록 · 보도 인용",
      lines: [
        { speaker: "이웃", text: "그 사람, 피를 흘리고 있어요.", state: "shown", opacity: 0.6 },
        { speaker: "상담원", text: "구급차가 필요한가요?", state: "shown", opacity: 0.6 },
        { speaker: "이웃", text: "아니요, 그 사람 간호사예요. 구급차는 그 남자한테 불러 달래요. 죽었을지도 모른대요.", state: "shown", opacity: 0.6 },
        { speaker: "이웃", text: "그녀는 그 사람을 보낸 게 [별거 중인 남편]일지도 모른다고 걱정했어요.", at: T.newLine, blur: true },
      ],
      speech: [[-3, -1.2], [T.newLine, T.waveStop - 0.3]],
      flatAt: T.waveStop,
    });
    K.hold(tl, 5);
    return (t) => card.wave.draw(t);
  },
};
