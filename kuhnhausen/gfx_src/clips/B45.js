// B45 · L-B45_GFX_timeline-a_v1_하루-타임라인 · T12 · 풀프레임 · 5초
// 점 세 개를 0.8초 간격으로. 같은 시각처럼 보이지 않게 확실히 떨어뜨림. 정확한 시각 숫자는 넣지 않는다
window.CLIP = {
  file: "L-B45_GFX_timeline-a_v1_하루-타임라인",
  format: "full",
  duration: 5,
  build(stage, tl) {
    buildTimeline(stage, tl, { y: 480, x1: 200, x2: 1720, lineAt: 0.1, points: [
      { x: 400, label: "오후 · 숙소 체크인", at: 0.7 },
      { x: 960, label: "저녁 · 사건", at: 1.5 },
      { x: 1520, label: "밤 · 포틀랜드 귀환", at: 2.3 },
    ] });
    K.hold(tl, 5);
  },
};
