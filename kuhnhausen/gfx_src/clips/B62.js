// B62 · L-B62_GFX_board-e_v1_물음표-카드 · T04 · 풀프레임 · 5초 · 보드 오른쪽 빈자리에 얼굴 자리가 빈 카드 + 큰 "?"(옐로우)
window.CLIP = {
  file: "L-B62_GFX_board-e_v1_물음표-카드",
  format: "full",
  duration: 5,
  build(stage, tl) {
    const b = buildT04(stage, tl, { have: ["A", "B", "M", "H", "C", "A-B", "M-H"], add: [{ id: "Q", at: 1.0 }] });
    b.cam(tl, 0, 5, { s: 1.08, cx: 1080, cy: 470 }, "none");
    K.hold(tl, 5);
  },
};
