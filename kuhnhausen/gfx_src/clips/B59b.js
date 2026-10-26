// B59 · L-B59_GFX_board-d_v2_보드-전과 · T04 · 풀프레임 · 3초 · "해피" 카드 아래 "살인 공모 전과" 카드 추가
window.CLIP = {
  file: "L-B59_GFX_board-d_v2_보드-전과",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const b = buildT04(stage, tl, { have: ["A", "B", "M", "H", "A-B", "M-H"], add: [{ id: "C", at: 0.8 }], cam: { s: 1.1, cx: 1160, cy: 420 } });
    b.cam(tl, 0, 3, { s: 1.15, cx: 1170, cy: 420 }, "none");
    K.hold(tl, 3);
  },
};
