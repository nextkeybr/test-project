// B80 · L-B80_GFX_card_v2_911카드-회수 · T01 · 풀프레임 · 4초
// 오프닝 카드의 그 줄만 가운데에 떠오른 뒤 1.5초 더 머물고, 화이트로 번지며 사라짐. 끝 프레임은 화이트 20%(다음 사진으로 디졸브용)
window.CLIP = {
  file: "L-B80_GFX_card_v2_911카드-회수",
  format: "full",
  duration: 4,
  build(stage, tl) {
    const row = K.div(stage, { left: "50%", top: "450px", display: "flex", alignItems: "center", gap: "28px" });
    gsap.set(row, { xPercent: -50, yPercent: -50 });
    K.div(row, { position: "relative", width: "150px", height: "64px", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--yellow)", color: "var(--black)", fontSize: "36px", fontWeight: "800" }, "신고자");
    const txt = K.div(row, { position: "relative", fontSize: "56px", fontWeight: "800", color: "var(--white)",
      whiteSpace: "nowrap", lineHeight: "1" }, "구급차는 그 남자한테 불러 달래요.");
    K.inUp(tl, row, 0.0, 0.45);
    const wash = K.div(stage, { inset: "0px", background: "var(--white)", opacity: 0 });
    tl.to(txt, { filter: "blur(10px)", duration: 0.9, ease: "power1.in" }, 2.5);
    tl.to(row, { scale: 1.05, opacity: 0, duration: 0.9, ease: "power1.in" }, 2.55);
    tl.to(wash, { opacity: 0.55, duration: 0.45, ease: "power2.out" }, 2.5);
    tl.to(wash, { opacity: 0.2, duration: 0.6, ease: "power2.inOut" }, 2.95);
    K.hold(tl, 4);
  },
};
