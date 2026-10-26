// B24 · L-B24_GFX_card-b_v1_빈-증거카드2 · 풀프레임 · 3초
// 오른쪽 카드 클로즈업 → 2초에 줌아웃해 두 장이 나란히 보이며 끝남
window.CLIP = {
  file: "L-B24_GFX_card-b_v1_빈-증거카드2",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const s = sceneB24(stage);
    s.rise(tl, s.cards[1], 0.0, 1.9);
    s.cam(s.cards[1], 2.6);
    tl.to(s.world, Object.assign(s.camWide(), { duration: 0.95, ease: "power2.inOut" }), 2.0);
    K.hold(tl, 3);
  },
};
