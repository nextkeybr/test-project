// B80 · L-B80_GFX_card_v1_911카드-회수 · T01 · 풀프레임 · 2초
// 오프닝 카드의 그 줄만 가운데에 1초 떠오른 뒤 화이트로 번지며 사라짐. 끝 프레임은 화이트 20%(다음 사진으로 디졸브용)
window.CLIP = {
  file: "L-B80_GFX_card_v1_911카드-회수",
  format: "full",
  duration: 2,
  build(stage, tl) {
    const row = K.div(stage, { left: "50%", top: "450px", display: "flex", alignItems: "center", gap: "28px" });
    gsap.set(row, { xPercent: -50, yPercent: -50 });
    K.div(row, { position: "relative", width: "150px", height: "64px", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--yellow)", color: "var(--black)", fontSize: "36px", fontWeight: "800" }, "신고자");
    const txt = K.div(row, { position: "relative", fontSize: "56px", fontWeight: "800", color: "var(--white)",
      whiteSpace: "nowrap", lineHeight: "1" }, "구급차는 그 남자한테 불러 달래요.");
    K.inUp(tl, row, 0.0, 0.45);
    const wash = K.div(stage, { inset: "0px", background: "var(--white)", opacity: 0 });
    tl.to(txt, { filter: "blur(10px)", duration: 0.9, ease: "power1.in" }, 1.0);
    tl.to(row, { scale: 1.05, opacity: 0, duration: 0.9, ease: "power1.in" }, 1.05);
    tl.to(wash, { opacity: 0.55, duration: 0.45, ease: "power2.out" }, 1.0);
    tl.to(wash, { opacity: 0.2, duration: 0.5, ease: "power2.inOut" }, 1.45);
    K.hold(tl, 2);
  },
};
