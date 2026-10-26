// B76 · L-B76_GFX_timeline-d1_v1_AP기사 · T09 · 풀프레임 · 6초 (등장 시각: timing.json "B76d1")
// RD-005 캡처가 아직 없어 문장만 카드로(형광펜 없이). 3초에 문장 단위로 한 번 더 줌
window.CLIP = {
  file: "L-B76_GFX_timeline-d1_v1_AP기사",
  format: "full",
  duration: 6,
  build(stage, tl) {
    const T = window.TIMING.B76d1;
    const d = buildT09(stage, tl, {
      sentences: [{ en: "died Friday of natural causes", ko: "금요일 자연사", at: T.sentence }],
      source: "보도 인용 · AP 2014", sourceAt: T.sentence + 0.3,
    });
    stage.appendChild(d.src); // 출처 라벨은 줌에 휩쓸리지 않게 밖으로
    const pr = d.paper.getBoundingClientRect();
    d.root.style.transformOrigin = `960px ${pr.top + pr.height / 2}px`;
    tl.to(d.root, { scale: 1.3, duration: 1.2, ease: "power2.inOut" }, T.zoom);
    K.bottomMask(stage);
    K.hold(tl, 6);
  },
};
