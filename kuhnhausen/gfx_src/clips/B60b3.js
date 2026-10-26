// B60 · L-B60_GFX_timeline-b3_v1_2003 · T12 · 풀프레임 · 5초 (기존 12초 1개를 b1·b2·b3로 분리. 등장 시각: timing.json "B60b3")
window.CLIP = {
  file: "L-B60_GFX_timeline-b3_v1_2003",
  format: "full",
  duration: 5,
  build(stage, tl) {
    sceneB60(stage, tl, "b3", window.TIMING.B60b3);
    K.hold(tl, 5);
  },
};
