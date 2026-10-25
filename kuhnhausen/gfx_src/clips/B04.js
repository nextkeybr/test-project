// B04 · L-B04_GFX_card_v1_911카드-대화2 · T01 + T08 · 풀프레임 · 9초
window.CLIP = {
  file: "L-B04_GFX_card_v1_911카드-대화2",
  format: "full", // full = .mp4 / overlay = 투명 .mov
  duration: 9,
  build(stage, tl) {
    const card = buildT01(stage, tl, {
      label: "911 녹취록 · 보도 인용",
      // B03 끝 상태에서 이어짐: 줄1·2는 옅게, 줄3은 진하게
      lines: [
        { speaker: "신고자", text: "…침입자가 있어요.", state: "shown", opacity: 0.6 },
        { speaker: "상담원", text: "그분 바꿔 줄 수 있나요?", state: "shown", opacity: 0.6 },
        { speaker: "신고자", text: "그 사람, 피를 흘리고 있어요.", state: "shown", opacity: 1 },
        { speaker: "상담원", text: "구급차가 필요한가요?", at: 1.0 },
        { speaker: "신고자", text: "아니요, 그 사람 간호사예요. 구급차는 그 남자한테 불러 달래요. 죽었을지도 모른대요.", at: 2.2 },
      ],
      speech: [[-6, -4.6], [-3.8, -1.2], [1.0, 2.0], [2.2, 3.4], [3.65, 5.3], [5.6, 6.9]],
      flatAt: 8.5,
    });

    // 강조가 뜨면 대화 줄은 뒤로 물러남
    tl.to(card.list, { opacity: 0.28, duration: 0.4, ease: "power2.out" }, 4.5);
    buildT08(stage, tl, { text: "구급차는 그 남자한테", at: 4.5, centerY: 540 });

    return (t) => card.wave.draw(t);
  },
};
