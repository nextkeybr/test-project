// B15 · L-B15_GFX_diagram-a_v1_망치-반경-멀때 · 풀프레임 · 4초 (기존 7초 1개를 a·b로 분리, 사이에 AI 컷 두 개)
// 두 사람이 떨어져 있고 큰 호(레드)가 그려짐 → 3초 "멀 때" → 끝까지 정지
window.CLIP = {
  file: "L-B15_GFX_diagram-a_v1_망치-반경-멀때",
  format: "full",
  duration: 4,
  build(stage, tl) { const f = sceneB15(stage, tl, "a"); K.hold(tl, 4); return f; },
};
