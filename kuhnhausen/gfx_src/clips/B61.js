// B61 · L-B61_GFX_timeline-c_v2_2004-고용 · T12 · 오버레이 · 8초 (매장 일러스트 위 아래쪽 띠)
// B60 타임라인 오른쪽 끝에 점 "2004 · 남편이 청소원으로 고용" 추가(2.0초)
window.CLIP = {
  file: "L-B61_GFX_timeline-c_v2_2004-고용",
  format: "overlay",
  duration: 8,
  build(stage, tl) {
    const band = K.div(stage, { left: "0px", top: "590px", width: "1920px", height: "270px", background: "rgba(11,11,11,0.78)" });
    const X = (y) => 200 + (y - 1990) * (1520 / 15);
    const t = buildTimeline(band, tl, { y: 150, x1: 160, x2: 1760, size: 34, points: [
      { x: X(1991), label: "1991 · 살해 계획" },
      { x: X(1994), label: "1994 · 유죄 인정", below: true },
      { x: X(2003), label: "2003 · 출소" },
    ] });
    t.bar(null, X(1994), X(2003), "9년 복역");
    t.add({ x: X(2004), label: "2004 · 남편이 청소원으로 고용", at: 2.0, below: true, align: "right" });
    K.inUp(tl, band, 0.1, 0.4);
    K.hold(tl, 8);
  },
};
