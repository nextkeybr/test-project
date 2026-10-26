// B43 · L-B43_GFX_map-a_v1_포틀랜드-링컨시티 · T11 · 풀프레임 · 8초
// 0~1.5초 오리건 윤곽 줌인 → 1.5~5초 포틀랜드→링컨시티 옐로우 실선(카메라가 따라감) → 5.5초 라벨
// 경로는 지도용 설명 곡선(실제 도로 경로 데이터 아님)
window.CLIP = {
  file: "L-B43_GFX_map-a_v1_포틀랜드-링컨시티",
  format: "full",
  duration: 8,
  build(stage, tl) {
    const m = buildT11(stage, tl, { cam: { s: 1, lat: 44.1, lon: -120.55 } });
    m.city("포틀랜드", 45.52, -122.68, 1.0, "right", 0.9);
    m.city("링컨시티", 44.96, -124.02, 4.9, "left", 4.8);
    const r = m.route([[45.52, -122.68], [45.3, -122.97], [45.21, -123.19], [45.07, -123.62], [44.96, -124.02]]);
    tl.to(m.cam, { s: 2.3, lat: 45.3, lon: -123.0, duration: 1.5, ease: "power2.inOut" }, 0);
    tl.to(r, { p: 1, duration: 3.5, ease: "power1.inOut" }, 1.5);
    tl.to(m.cam, { s: 2.6, lat: 45.08, lon: -123.55, duration: 3.5, ease: "power1.inOut" }, 1.5);
    const lab = K.label(stage, "당일 오후 숙소 체크인", {}, "mid");
    m.pinTo(lab, 44.96, -124.02, 0, 40);
    gsap.set(lab, { xPercent: -50 });
    K.inUp(tl, lab, 5.5);
    K.hold(tl, 8);
    return () => m.draw();
  },
};
