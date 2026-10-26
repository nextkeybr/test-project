// B38-a · L-B38_GFX_card-a_v1_911카드-줄공개 · T01 · 풀프레임 · 4초
// B37의 흐린 줄에서 시작해 0.5~1.2초에 흐림이 걷힘. 대괄호는 원문 'ex-partner'를 영상 속 호칭에 맞춘 설명 표시라 그대로 보인다
window.CLIP = {
  file: "L-B38_GFX_card-a_v1_911카드-줄공개",
  format: "full",
  duration: 4,
  build(stage, tl) {
    const card = buildT01(stage, tl, {
      label: "911 녹취록 · 보도 인용",
      lines: [
        { speaker: "이웃", text: "그 사람, 피를 흘리고 있어요.", state: "shown", opacity: 0.6 },
        { speaker: "상담원", text: "구급차가 필요한가요?", state: "shown", opacity: 0.6 },
        { speaker: "이웃", text: "아니요, 그 사람 간호사예요. 구급차는 그 남자한테 불러 달래요. 죽었을지도 모른대요.", state: "shown", opacity: 0.6 },
        { speaker: "이웃", text: "그녀는 그 사람을 보낸 게 [별거 중인 남편]일지도 모른다고 걱정했어요.", state: "shown", blur: true, unblurAt: 0.5 },
      ],
      flatAt: 0, // B37 끝에서 멈춘 파형 그대로
    });
    K.hold(tl, 4);
    return (t) => card.wave.draw(t);
  },
};
