// B42 · L-B42_GFX_board-a_v2_증거보드-등장 · T04 · 풀프레임 · 3초(비트 6초 중 뒷부분)
// 빈 보드에 카메라가 다가가며 카드 1장이 핀으로 꽂힘
window.CLIP = {
  file: "L-B42_GFX_board-a_v2_증거보드-등장",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const b = buildT04(stage, tl, { add: [{ id: "A", at: 1.0 }], cam: { s: 1, cx: 960, cy: 460 } });
    b.cam(tl, 0, 3, { s: 1.5, cx: 280, cy: 320 }, "power2.out");
    K.hold(tl, 3);
  },
};
