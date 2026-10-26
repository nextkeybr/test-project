// B79 · L-B79_GFX_label_v2_2017 · T07(작게) · 오버레이 · 30초 (비트 전체에 깔리는 작은 라벨)
window.CLIP = {
  file: "L-B79_GFX_label_v2_2017",
  format: "overlay",
  duration: 30,
  build(stage, tl) {
    buildT07(stage, tl, { pos: { left: 80, bottom: 220 }, bigSize: 56, big: { text: "2017년", at: 0.5, dur: 0.4 },
      subs: [{ text: "경찰 자기방어 프로그램 · 범죄 피해자 안내 서비스", at: 1.1, dur: 0.9 }] });
    K.hold(tl, 30);
  },
};
