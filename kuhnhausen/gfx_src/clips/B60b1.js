// B60 · L-B60_GFX_timeline-b1_v1_1991 · T12 · 풀프레임 · 4초 (기존 12초 1개를 b1·b2·b3로 분리. 등장 시각: timing.json "B60b1")
window.CLIP = {
  file: "L-B60_GFX_timeline-b1_v1_1991",
  format: "full",
  duration: 4,
  build(stage, tl) {
    sceneB60(stage, tl, "b1", window.TIMING.B60b1);
    K.hold(tl, 4);
  },
};
