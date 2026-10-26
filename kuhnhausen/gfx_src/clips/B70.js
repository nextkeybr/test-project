// B70 · L-B70_GFX_bar_v2_10칸-막대 · 풀프레임 · 5초
// 가로 10칸 막대(옐로우), 위에 "징역 10년". 1.0초부터 오른쪽 칸부터 한 칸씩 꺼짐(0.3초 간격)
// → 마지막에 막대가 달력 모양으로 변형(B71 달력과 위치·크기를 맞춘 그래픽 매치컷)
window.CLIP = {
  file: "L-B70_GFX_bar_v2_10칸-막대",
  format: "full",
  duration: 5,
  build(stage, tl) {
    // B71과 같은 달력(2014년 9월)을 숨겨 두고 끝에 드러냄
    const cal = buildCalendar(stage, tl, { year: 2014, month: 9, x: 900, y: 150 });
    gsap.set(cal.root, { opacity: 0 });
    const head = K.div(stage, { left: "960px", top: "300px", background: "var(--yellow)", color: "var(--black)", fontSize: "72px",
      fontWeight: "800", lineHeight: "1", padding: "19px 30px 22px" }, "징역 10년");
    gsap.set(head, { xPercent: -50 });
    const CW = cal.CW, CH = cal.CH;
    const cells = [];
    for (let i = 0; i < 10; i++) {
      const x = 960 - 5 * 136 + i * 136 + 4;
      const c = K.div(stage, { left: "0px", top: "0px", width: CW - 8 + "px", height: CH - 8 + "px", background: "var(--yellow)",
        border: "2px solid var(--yellow)" });
      gsap.set(c, { x, y: 470 });
      cells.push(c);
    }
    cells.slice().reverse().forEach((c, k) => {
      tl.to(c, { backgroundColor: "rgba(255,212,0,0)", borderColor: "rgba(242,242,242,0.25)", duration: 0.15 }, 1.0 + k * 0.3);
    });
    // 변형: 칸들이 달력의 1~10일 칸 자리로
    tl.to(head, { opacity: 0, y: -12, duration: 0.3, ease: "power2.in" }, 4.0);
    cells.forEach((c, i) => {
      const r = cal.cells[i + 1].cell.getBoundingClientRect();
      tl.to(c, { x: r.left, y: r.top, duration: 0.6, ease: "power3.inOut" }, 4.0 + i * 0.02);
    });
    tl.to(cal.root, { opacity: 1, duration: 0.4 }, 4.5);
    tl.to(cells, { opacity: 0, duration: 0.2 }, 4.8);
    K.hold(tl, 5);
  },
};
