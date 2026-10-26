// B76 · L-B76_GFX_timeline-d2_v1_석달 · T12 · 풀프레임 · 5초 (등장 시각: timing.json "B76d2")
window.CLIP = {
  file: "L-B76_GFX_timeline-d2_v1_석달",
  format: "full",
  duration: 5,
  build(stage, tl) {
    const T = window.TIMING.B76d2;
    const t = buildTimeline(stage, tl, { y: 470, x1: 300, x2: 1620, lineAt: 0, points: [
      { x: 560, label: "2014년 6월 13일 · 사망", at: T.death, below: true },
      { x: 1360, label: "2014년 9월 14일 · 출소 예정", at: T.release, below: true },
    ] });
    t.bar(tl, 560, 1360, "약 석 달", T.gap, T.gap + 0.6);
    K.hold(tl, 5);
  },
};
