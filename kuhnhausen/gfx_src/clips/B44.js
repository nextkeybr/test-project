// B44 · L-B44_GFX_map-b_v2_밤-귀환 · T11 · 풀프레임 · 4초
// B43 끝 상태에서 같은 길을 되짚어 오는 옐로우 점선 → 포틀랜드 점 깜빡 + "그날 밤 포틀랜드로"
window.CLIP = {
  file: "L-B44_GFX_map-b_v2_밤-귀환",
  format: "full",
  duration: 4,
  build(stage, tl) {
    const m = buildT11(stage, tl, { cam: { s: 2.6, lat: 45.08, lon: -123.55 } });
    const pdx = m.city("포틀랜드", 45.52, -122.68, null, "right");
    m.city("링컨시티", 44.96, -124.02, null, "left");
    const go = m.route([[45.52, -122.68], [45.3, -122.97], [45.21, -123.19], [45.07, -123.62], [44.96, -124.02]]);
    go.p = 1;
    // 돌아오는 길: 같은 길을 살짝 위로 띄워 점선으로
    const back = m.route([[45.0, -124.02], [45.11, -123.62], [45.25, -123.19], [45.34, -122.97], [45.52, -122.68]], { dashed: true });
    const old = K.label(stage, "당일 오후 숙소 체크인", {}, "mid");
    m.pinTo(old, 44.96, -124.02, 0, 40);
    gsap.set(old, { xPercent: -50 });
    tl.to(old, { opacity: 0, duration: 0.3 }, 0.1);
    tl.to(back, { p: 1, duration: 2.3, ease: "power1.inOut" }, 0.3);
    tl.to(m.cam, { lat: 45.25, lon: -123.2, duration: 2.6, ease: "power1.inOut" }, 0.3);
    [2.6, 3.2].forEach((at) => tl.fromTo(pdx.dot, { blink: 0 }, { blink: 1, duration: 0.6, ease: "power1.out", immediateRender: false }, at));
    const lab = K.label(stage, "그날 밤 포틀랜드로", {}, "mid");
    m.pinTo(lab, 45.52, -122.68, 0, -100);
    gsap.set(lab, { xPercent: -50 });
    K.inUp(tl, lab, 2.8);
    K.hold(tl, 4);
    return () => m.draw();
  },
};
