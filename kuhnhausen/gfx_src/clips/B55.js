// B55 · L-B55_GFX_board-c_v1_빨간실-연결 · T04 · 풀프레임 · 6초
// 카드 두 장(사진 자리: RP-004, RP-005 — 사진이 아직 없어 회색 실루엣) → 1.5초 레드 실 + "고용: 청소원" → 4.0초 보드 전체로 줌아웃
window.CLIP = {
  file: "L-B55_GFX_board-c_v1_빨간실-연결",
  format: "full",
  duration: 6,
  build(stage, tl) {
    const b = buildT04(stage, tl, { have: ["A", "B", "A-B"], add: [{ id: "M", at: 0.2 }, { id: "H", at: 0.6 }, { id: "M-H", at: 1.5 }],
      cam: { s: 1.45, cx: 960, cy: 330 } });
    b.cam(tl, 4.0, 1.3, { s: 1, cx: 960, cy: 460 });
    K.hold(tl, 6);
  },
};
