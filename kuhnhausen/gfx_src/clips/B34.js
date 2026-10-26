// B34 · L-B34_GFX_doc_v2_부검-정당방위 · T09 · 풀프레임 · 9초
// RD-004 캡처가 아직 없어 문장만 카드로(형광펜 없이). 캡처가 오면 v2
window.CLIP = {
  file: "L-B34_GFX_doc_v2_부검-정당방위",
  format: "full",
  duration: 9,
  build(stage, tl) {
    buildT09(stage, tl, {
      sentences: [
        { en: "An autopsy revealed the cause of death as strangulation.", ko: "부검 결과 사인은 교살로 밝혀졌다.", at: 0.4 },
        { en: "Police say she acted in self-defense.", ko: "경찰은 그녀가 정당방위를 했다고 밝혔다.", at: 4.5 },
      ],
      source: "보도 인용 · CBS/AP 2006",
      sourceAt: 0.8,
    });
    K.hold(tl, 9);
  },
};
