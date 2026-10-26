// B27 · L-B27_GFX_stamp_v1_증거-도장 · T04 카드 + T05 · 풀프레임 · 3초 (B27 강조 자막 컷 바로 앞)
// B25·B26에서 채운 카드 두 장이 나란히. 1.0초에 두 카드 위로 옐로우 도장 "증거"가 0.3초 간격으로(110% → 100%)
window.CLIP = {
  file: "L-B27_GFX_stamp_v1_증거-도장",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const big = { height: "260px", fontSize: "60px" };
    const c1 = window.evCard(stage, { left: 300, top: 330, width: 560 }, "이빨 자국 → 범인");
    const c2 = window.evCard(stage, { left: 1060, top: 330, width: 560 }, "신분증");
    Object.assign(c1.style, big); Object.assign(c2.style, big);
    [[c1, 1.0], [c2, 1.3]].forEach(([c, at]) => {
      const st = K.div(c, { right: "-34px", top: "-40px", background: "var(--yellow)", color: "var(--black)", fontSize: "56px",
        fontWeight: "800", lineHeight: "1", padding: "12px 26px 14px", border: "5px solid var(--black)", outline: "4px solid var(--yellow)" }, "증거");
      gsap.set(st, { rotation: -8, opacity: 0, scale: 1.1 });
      tl.set(st, { opacity: 1 }, at);
      tl.to(st, { scale: 1, duration: 0.18, ease: "back.out(3)" }, at);
    });
    K.hold(tl, 3);
  },
};
