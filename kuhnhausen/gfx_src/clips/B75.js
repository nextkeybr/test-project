// B75 · L-B75_GFX_countdown_v1_멈춘-카운트다운 · 오버레이 · 8초 (교도소 외관 위)
// 오른쪽 위 "출소까지" + "약 석 달". 0~4초 테두리가 째깍거리듯 깜빡 → 5.0초 멈추고 테두리 화이트 → 회색(화이트 40%)
// 일수 숫자는 쓰지 않는다
window.CLIP = {
  file: "L-B75_GFX_countdown_v1_멈춘-카운트다운",
  format: "overlay",
  duration: 8,
  holdFrom: 5.4,
  build(stage, tl) {
    const box = K.div(stage, { right: "80px", top: "60px", border: "4px solid #F2F2F2", background: "rgba(11,11,11,0.6)",
      padding: "20px 34px 24px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" });
    K.div(box, { position: "relative", color: "var(--white)", opacity: 0.8, fontSize: "32px", fontWeight: "700", lineHeight: "1" }, "출소까지");
    K.div(box, { position: "relative", color: "var(--white)", fontSize: "60px", fontWeight: "800", lineHeight: "1" }, "약 석 달");
    K.inUp(tl, box, 0.1, 0.4);
    for (let k = 0; k < 8; k++) tl.set(box, { borderColor: k % 2 ? "#F2F2F2" : "rgba(242,242,242,0.15)" }, 0.5 + k * 0.5);
    tl.set(box, { borderColor: "#F2F2F2" }, 4.5);
    tl.to(box, { borderColor: "rgba(242,242,242,0.4)", duration: 0.35 }, 5.0);
    K.hold(tl, 8);
  },
};
