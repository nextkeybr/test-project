// B51 · L-B51_GFX_doc_v1_수첩-하이라이트 · T09 · 풀프레임 · 6초
// RD-001 수첩 사진이 아직 없어 문장만 카드로(형광펜·줌 없이). 사진이 오면 v2로 줌 + "Call Mike" 형광펜
window.CLIP = {
  file: "L-B51_GFX_doc_v1_수첩-하이라이트",
  format: "full",
  duration: 6,
  build(stage, tl) {
    buildT09(stage, tl, {
      box: { left: 610, top: 0, width: 700 }, enSize: 96,
      sentences: [{ en: "Call Mike", ko: "마이크에게 전화", at: 1.0, koAt: 3.5 }],
      source: "실제 자료 · WWeek 2016",
      sourceAt: 1.2,
    });
    K.hold(tl, 6);
  },
};
