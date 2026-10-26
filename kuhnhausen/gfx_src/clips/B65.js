// B65 · L-B65_GFX_compare_v2_보험과-집 · 풀프레임 · 12초
// 좌우 두 칸 → 9.0초 화면 전체가 증거 보드로 줌아웃되며 모든 카드가 한 화면에. '동기'라는 단어는 쓰지 않는다
window.CLIP = {
  file: "L-B65_GFX_compare_v2_보험과-집",
  format: "full",
  duration: 12,
  build(stage, tl) {
    const board = buildT04(stage, tl, { have: ["A", "B", "M", "H", "C", "Q", "A-B", "M-H", "Q-M", "Q-H"], qFlipped: true, cam: { s: 1, cx: 960, cy: 460 } });
    gsap.set(board.world, { opacity: 0 });
    const cmp = K.div(stage, { left: "0px", top: "0px", width: "1920px", height: "1080px", background: "var(--black)" });
    K.div(cmp, { left: "958px", top: "200px", width: "3px", height: "520px", background: "rgba(242,242,242,0.35)" });
    const col = (cx, items) => {
      const c = K.div(cmp, { left: cx + "px", top: "250px", display: "flex", flexDirection: "column", alignItems: "center", gap: "34px" });
      gsap.set(c, { xPercent: -50 });
      items.forEach(([t, st]) => K.div(c, Object.assign({ position: "relative", whiteSpace: "nowrap", lineHeight: "1" }, st), t));
      return c;
    };
    const head = { background: "var(--yellow)", color: "var(--black)", fontSize: "44px", fontWeight: "800", padding: "14px 26px 16px" };
    const main = { color: "var(--white)", fontSize: "64px", fontWeight: "800" };
    const left = col(500, [["생명보험 수익자", head], ["수전의 남자 형제", main], ["남편 아님", { color: "var(--white)", opacity: 0.6, fontSize: "40px", fontWeight: "700" }]]);
    const right = col(1420, [["집", head], ["대출 상환 완료", main]]);
    K.inUp(tl, left, 2.0, 0.5);
    K.inUp(tl, right, 5.0, 0.5);
    // 9.0초: 비교 화면이 작아지며 빠지고 보드 전체가 드러남
    tl.to(cmp, { scale: 0.35, opacity: 0, duration: 0.9, ease: "power2.in" }, 9.0);
    board.cam(tl, 9.0, 0.01, { s: 1.6, cx: 960, cy: 460 });
    tl.to(board.world, { opacity: 1, duration: 0.6 }, 9.3);
    board.cam(tl, 9.3, 1.5, { s: 1, cx: 960, cy: 460 }, "power3.out");
    K.hold(tl, 12);
  },
};
