// B47-b · L-B47_GFX_board-b_v1_보드-경보해제 · T04 · 풀프레임 · 2초 · 카드 "낮 경보 해제" 추가, 첫 카드와 레드 실로 연결
window.CLIP = {
  file: "L-B47_GFX_board-b_v1_보드-경보해제",
  format: "full",
  duration: 2,
  build(stage, tl) {
    buildT04(stage, tl, { have: ["A"], add: [{ id: "B", at: 0.15 }, { id: "A-B", at: 0.7 }], cam: { s: 1.3, cx: 280, cy: 430 } });
    K.hold(tl, 2);
  },
};
