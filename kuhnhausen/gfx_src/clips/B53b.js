// B53 · L-B53_GFX_board-b2_v1_마이크-이름카드 · T04 · 풀프레임 · 3초
// 증거 보드에 새 카드 "마이크"(사진 자리 RP-004N이 없어 회색 실루엣) + 카드 아래 작은 글자 "수첩 메모 · 남편 이름"
// 0.4초 카드가 위에서 떨어지며 핀에 꽂힘 → 끝까지 정지
window.CLIP = {
  file: "L-B53_GFX_board-b2_v1_마이크-이름카드",
  format: "full",
  duration: 3,
  build(stage, tl) {
    buildT04(stage, tl, { have: ["A", "B", "A-B"], add: [{ id: "M2", at: 0.4 }], cam: { s: 1.3, cx: 640, cy: 410 } });
    K.hold(tl, 3);
  },
};
