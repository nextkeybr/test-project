// B24 · L-B24_GFX_card-a_v1_빈-증거카드1 · 풀프레임 · 3초 (기존 4초 1개를 a·b로 분리)
// 왼쪽 빈 카드가 떠오르는 장면을 화면 가득 클로즈업. 글자 없음
window.CLIP = {
  file: "L-B24_GFX_card-a_v1_빈-증거카드1",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const s = sceneB24(stage);
    s.rise(tl, s.cards[0], 0.2, 2.6);
    s.cam(s.cards[0], 2.6);
    tl.to(s.world, Object.assign(s.camAt(s.cards[0], 2.75), { duration: 3, ease: "none" }), 0);
    K.hold(tl, 3);
  },
};
