// B59 · L-B59_GFX_stamp_v1_전과-도장 · 오버레이 · 3초 · 해피 사진(RP-005) 위에 옐로우 도장이 쾅(0.8초, 살짝 흔들림 허용)
window.CLIP = {
  file: "L-B59_GFX_stamp_v1_전과-도장",
  format: "overlay",
  duration: 3,
  holdFrom: 1.4,
  build(stage, tl) {
    const st = K.div(stage, { left: "50%", top: "460px", background: "var(--yellow)", color: "var(--black)", fontSize: "76px",
      fontWeight: "800", lineHeight: "1", padding: "26px 44px 30px", border: "6px solid var(--black)", outline: "6px solid var(--yellow)",
      whiteSpace: "nowrap" }, "살인 공모 전과");
    gsap.set(st, { xPercent: -50, yPercent: -50, rotation: -7, scale: 1.7, opacity: 0 });
    tl.to(st, { opacity: 1, duration: 0.06 }, 0.8);
    tl.to(st, { scale: 1, duration: 0.14, ease: "power4.in" }, 0.8);
    // 찍히는 순간 짧은 흔들림
    [[-7, 6], [5, -4], [-3, 2], [0, 0]].forEach(([x, y], i) => tl.to(st, { x, y, duration: 0.04 }, 0.94 + i * 0.04));
    K.hold(tl, 3);
  },
};
