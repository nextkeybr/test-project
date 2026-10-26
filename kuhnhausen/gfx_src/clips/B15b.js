// B15 · L-B15_GFX_diagram-b_v1_망치-반경-붙었을때 · 풀프레임 · 4초
// a의 끝 상태에서 시작 → 0.5~2초 수전이 바짝 다가감 → 2~3.5초 호가 작게 → 3초 "붙었을 때"
window.CLIP = {
  file: "L-B15_GFX_diagram-b_v1_망치-반경-붙었을때",
  format: "full",
  duration: 4,
  build(stage, tl) { const f = sceneB15(stage, tl, "b"); K.hold(tl, 4); return f; },
};
