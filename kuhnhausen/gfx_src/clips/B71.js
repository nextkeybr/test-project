// B71 · L-B71_GFX_calendar-c_v1_출소예정일 · T12(달력) · 풀프레임 · 3초 · "2014년 9월 14일" + "출소 예정"
window.CLIP = {
  file: "L-B71_GFX_calendar-c_v1_출소예정일",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const cal = buildCalendar(stage, tl, { year: 2014, month: 9, x: 900, y: 150 });
    cal.fill(tl, 14, 0.4, 1, 0.25);
    buildT07(stage, tl, { pos: { left: 100, top: 360 }, bigSize: 64, big: { text: "2014년 9월 14일", at: 0.6, dur: 0.6 },
      subs: [{ text: "출소 예정", at: 1.3, dur: 0.3 }] });
    K.hold(tl, 3);
  },
};
