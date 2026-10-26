// B60 · L-B60_GFX_timeline-b_v1_1991-2003 · T12 · 풀프레임 · 12초
// 나레이션에 맞춰 1.0, 4.0, 8.0초에 점 등장 + 1994~2003 구간 막대 "9년 복역". 앞 사건 피해자의 이름은 넣지 않는다
window.CLIP = {
  file: "L-B60_GFX_timeline-b_v1_1991-2003",
  format: "full",
  duration: 12,
  build(stage, tl) {
    const X = (y) => 200 + (y - 1990) * (1520 / 15);
    const t = buildTimeline(stage, tl, { y: 520, x1: 160, x2: 1760, lineAt: 0.2, points: [
      { x: X(1991), label: "1991 · 살해 계획", at: 1.0 },
      { x: X(1994), label: "1994 · 유죄 인정", at: 4.0, below: true },
      { x: X(2003), label: "2003 · 출소", at: 8.0 },
    ] });
    t.bar(tl, X(1994), X(2003), "9년 복역", 8.4, 9.0);
    K.hold(tl, 12);
  },
};
