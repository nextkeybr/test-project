// B14-b · L-B14_GFX_hammer-a_v2_망치아이콘-등장 · T03 · 오버레이 · 4초 · 망치는 '남자' 쪽
// 3·4번 구간 재연 영상 위에 계속 얹으므로 퇴장 없음
window.CLIP = {
  file: "L-B14_GFX_hammer-a_v2_망치아이콘-등장",
  format: "overlay",
  duration: 4,
  holdFrom: 1.5,
  build(stage, tl) {
    buildT03(stage, tl, { start: "man", inAt: 1.0 });
    K.hold(tl, 4);
  },
};
