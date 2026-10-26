// B19 · L-B19_GFX_quote_v1_죽이러-왔다 · T10(축소형) · 오버레이 · 4초 (AI 컷 '모자 그림자 측면' 위)
// 가장자리가 붉게 어두워지는 비네팅(레드 30%) + 가운데 화이트 인용 + 라벨. 강조 자막(T08)은 쓰지 않는다
// 비네팅은 화면 가장자리 전체에 깔리는 효과라 말자막 자리에도 옅게 걸린다
window.CLIP = {
  file: "L-B19_GFX_quote_v1_죽이러-왔다",
  format: "overlay",
  duration: 4,
  build(stage, tl) {
    const vig = K.div(stage, { inset: "0px" });
    K.div(vig, { inset: "0px", background: "radial-gradient(ellipse at center, rgba(11,11,11,0) 42%, rgba(11,11,11,0.5) 100%)" });
    K.div(vig, { inset: "0px", background: "radial-gradient(ellipse at center, rgba(232,32,42,0) 45%, rgba(232,32,42,0.3) 100%)" });
    gsap.set(vig, { opacity: 0 });
    tl.to(vig, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0.3);
    const wrap = K.div(stage, { left: "50%", top: "470px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" });
    gsap.set(wrap, { xPercent: -50, yPercent: -50 });
    const q = K.div(wrap, { position: "relative", color: "var(--white)", fontSize: "56px", fontWeight: "800", lineHeight: "1.2",
      whiteSpace: "nowrap", textShadow: "0 2px 18px rgba(11,11,11,0.6)" }, "“이 남자는 나를 죽이러 왔다”");
    const l = K.label(wrap, "수전의 회고", {});
    l.style.position = "relative";
    K.inUp(tl, q, 0.8);
    K.inUp(tl, l, 1.1, 0.35);
    K.hold(tl, 4);
  },
};
