// B60 · L-B60_GFX_timeline-b2_v1_1994 · T12 · 풀프레임 · 4초 (기존 12초 1개를 b1·b2·b3로 분리. 등장 시각: timing.json "B60b2")
window.CLIP = {
  file: "L-B60_GFX_timeline-b2_v1_1994",
  format: "full",
  duration: 4,
  build(stage, tl) {
    sceneB60(stage, tl, "b2", window.TIMING.B60b2);
    K.hold(tl, 4);
  },
};
