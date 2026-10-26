// B76 · L-B76_GFX_timeline-d_v1_사망과-출소예정 · T12 + T09 · 풀프레임 · 10초
// 0~4초 RD-005 AP 기사 문장(캡처가 없어 문장만, 형광펜 없이) → 4.5초 타임라인: 사망 / 출소 예정, 두 점 사이 "약 석 달"
window.CLIP = {
  file: "L-B76_GFX_timeline-d_v1_사망과-출소예정",
  format: "full",
  duration: 10,
  build(stage, tl) {
    const d = buildT09(stage, tl, {
      sentences: [{ en: "died Friday of natural causes", ko: "금요일 자연사", at: 0.4 }],
      source: "보도 인용 · AP 2014", sourceAt: 0.7,
    });
    tl.to(d.root, { opacity: 0, duration: 0.35, ease: "power2.in" }, 4.0);
    const t = buildTimeline(stage, tl, { y: 470, x1: 300, x2: 1620, lineAt: 4.5, points: [
      { x: 560, label: "2014년 6월 13일 · 사망", at: 4.9, below: true },
      { x: 1360, label: "2014년 9월 14일 · 출소 예정", at: 5.6, below: true },
    ] });
    t.bar(tl, 560, 1360, "약 석 달", 6.4, 7.0);
    K.hold(tl, 10);
  },
};
