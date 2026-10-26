// B57 · L-B57_GFX_calendar-b_v2_9월13일 · T12(달력) · 풀프레임 · 3초 · 8일에서 13일까지 빠르게 → 13일 "발견 · 체포"
window.CLIP = {
  file: "L-B57_GFX_calendar-b_v2_9월13일",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const c = buildCalendar(stage, tl, { year: 2006, month: 9, x: 512, y: 110 });
    c.setFill(6, 0.3); c.setFill(7, 0.3); c.setFill(8, 1);
    [9, 10, 11, 12, 13].forEach((d, i) => {
      const at = 0.3 + i * 0.22;
      c.fill(tl, d - 1, at, 0.3, 0.12);
      c.fill(tl, d, at, 1, 0.12);
    });
    c.note(tl, 13, "발견 · 체포", 1.6);
    K.hold(tl, 3);
  },
};
