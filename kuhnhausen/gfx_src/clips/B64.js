// B64 · L-B64_GFX_bubble_v1_돈-제안 · 오버레이 · 14초 (세 남자 일러스트 위, 말풍선 위치는 최종 그림에 맞춰 조정) · 고정 라벨 "진술"
window.CLIP = {
  file: "L-B64_GFX_bubble_v1_돈-제안",
  format: "overlay",
  duration: 14,
  build(stage, tl) {
    const lab = K.label(stage, "진술");
    K.inUp(tl, lab, 0.2, 0.35);
    const b1 = K.bubble(stage, "도와주면 돈을 주겠다", { left: 240, top: 240 }, "down-left");
    K.pop(tl, b1, 3.0, 0.4, 0.9);
    const money = K.label(stage, "5천 달러 · 진술", { left: 240, top: 400 }, "mid");
    K.inUp(tl, money, 7.0);
    const b2 = K.bubble(stage, "거절", { right: 240, top: 240 }, "down-right");
    K.pop(tl, b2, 10.0, 0.4, 0.9);
    K.out(tl, [lab, b1, money, b2], 13.7);
    K.hold(tl, 14);
  },
};
