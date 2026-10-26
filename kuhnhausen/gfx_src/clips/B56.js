// B56 · L-B56_GFX_calendar-a_v2_9월6일-8일 · T12(달력) · 풀프레임 · 3초(비트 5초 중 앞부분)
// 2006년 9월 달력, 6일 칸 옐로우 → 0.6초 간격으로 7일, 8일 → 8일에 "유서 남기고 사라짐"
window.CLIP = {
  file: "L-B56_GFX_calendar-a_v2_9월6일-8일",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const c = buildCalendar(stage, tl, { year: 2006, month: 9, x: 512, y: 110, at: 0 });
    c.fill(tl, 6, 0.3);
    c.fill(tl, 6, 0.9, 0.3); c.fill(tl, 7, 0.9);
    c.fill(tl, 7, 1.5, 0.3); c.fill(tl, 8, 1.5);
    c.note(tl, 8, "유서 남기고 사라짐", 1.8);
    K.hold(tl, 3);
  },
};
