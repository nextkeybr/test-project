// B23 · L-B23_GFX_quote_v1_오늘-여기서-죽는구나 · T10(축소형) · 오버레이 · 5초 (B23 홀드 컷 위)
// 홀드가 시작되고 1.0초 뒤 천천히 페이드인(0.8초) → 끝까지 유지. 움직임은 최소로. 강조 자막(T08)은 쓰지 않는다
window.CLIP = {
  file: "L-B23_GFX_quote_v1_오늘-여기서-죽는구나",
  format: "overlay",
  duration: 5,
  build(stage, tl) {
    const band = K.div(stage, { left: "0px", top: "560px", width: "1920px", height: "300px", background: "rgba(11,11,11,0.5)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" });
    K.div(band, { position: "relative", color: "var(--white)", fontSize: "56px", fontWeight: "800", lineHeight: "1.2" }, "“오늘 여기서 죽는구나”");
    K.div(band, { position: "relative", color: "rgba(242,242,242,0.5)", fontSize: "30px", fontWeight: "700", lineHeight: "1.2" }, "I'm going to die today.");
    const l = K.label(band, "의역 · 수전의 회고", {});
    l.style.position = "relative";
    gsap.set(band, { opacity: 0 });
    tl.to(band, { opacity: 1, duration: 0.8, ease: "power1.inOut" }, 1.0);
    K.hold(tl, 5);
  },
};
