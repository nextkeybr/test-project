// 증거 카드(작은 오버레이용): 블랙 바탕 + 화이트 테두리 + 위쪽 옐로우 핀
window.evCard = function (stage, pos, text) {
  const c = K.div(stage, Object.assign({ height: "180px", background: "var(--black)", border: "3px solid var(--white)",
    display: "flex", alignItems: "center", justifyContent: "center", color: "var(--white)", fontSize: "48px",
    fontWeight: "800", whiteSpace: "nowrap" }, K.px(pos)), text);
  K.div(c, { left: "50%", marginLeft: "-14px", top: "-15px", width: "28px", height: "28px", borderRadius: "50%", background: "var(--yellow)" });
  return c;
};
window.evCardIn = function (tl, c, at) {
  gsap.set(c, { opacity: 0, y: -24, scale: 1.06 });
  tl.to(c, { opacity: 1, duration: 0.2 }, at);
  tl.to(c, { y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, at);
};
