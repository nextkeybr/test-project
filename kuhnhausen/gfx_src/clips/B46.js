// B46 · L-B46_GFX_ui_v1_경보기록 · 풀프레임 · 7초 · 고정 라벨 "재연"
// 경보 기록을 단순하게 표현한 카드. 줄은 하나만("해제" + "낮 · 수전 근무 중"). 실제 기록의 다른 줄·시각 숫자는 지어내지 않는다
// 3.5초 B45 타임라인이 아래에서 올라오며 "오후" 앞에 새 점 "낮 · 경보 해제"
window.CLIP = {
  file: "L-B46_GFX_ui_v1_경보기록",
  format: "full",
  duration: 7,
  build(stage, tl) {
    K.inUp(tl, K.label(stage, "재연"), 0.1, 0.35);
    const card = K.div(stage, { left: "460px", top: "180px", width: "1000px", height: "190px", border: "3px solid var(--white)",
      display: "flex", alignItems: "center", gap: "36px", padding: "0 56px" });
    K.div(card, { position: "relative", background: "var(--yellow)", color: "var(--black)", fontSize: "52px", fontWeight: "800",
      lineHeight: "1", padding: "16px 30px 18px" }, "해제");
    K.div(card, { position: "relative", color: "var(--white)", fontSize: "48px", fontWeight: "800", lineHeight: "1" }, "낮 · 수전 근무 중");
    K.inUp(tl, card, 0.4, 0.5);
    const t = buildTimeline(stage, tl, { y: 690, x1: 140, x2: 1780, points: [
      { x: 750, label: "오후 · 숙소 체크인" },
      { x: 1180, label: "저녁 · 사건" },
      { x: 1600, label: "밤 · 포틀랜드 귀환" },
    ] });
    gsap.set(t.root, { opacity: 0, y: 140 });
    tl.to(t.root, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 3.5);
    t.add({ x: 320, label: "낮 · 경보 해제", at: 4.3 });
    K.hold(tl, 7);
  },
};
