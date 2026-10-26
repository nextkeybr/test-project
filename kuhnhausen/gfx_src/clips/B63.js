// B63 · L-B63_GFX_board-f_v1_감방동료-공개 · T04 · 풀프레임 · 5초
// "?" 카드가 0.5초에 뒤집힘 → "옛 감방 동료"(사진 없음, 회색 실루엣) → 2.0초 "마이크(남편)", "해피" 카드로 레드 실 두 줄
window.CLIP = {
  file: "L-B63_GFX_board-f_v1_감방동료-공개",
  format: "full",
  duration: 5,
  build(stage, tl) {
    const b = buildT04(stage, tl, { have: ["A", "B", "M", "H", "C", "Q", "A-B", "M-H"], add: [{ id: "Q-M", at: 2.0 }, { id: "Q-H", at: 2.2 }],
      cam: { s: 1.08, cx: 1080, cy: 470 } });
    b.flipQ(tl, 0.5);
    b.cam(tl, 1.6, 2.0, { s: 1, cx: 960, cy: 460 });
    K.hold(tl, 5);
  },
};
