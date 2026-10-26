// B32 · L-B32_GFX_floorplan-e_v1_복도-시신표시 · T02 · 풀프레임 · 5초
// 복도에 레드 사람 윤곽(누운 형태, 단순 실루엣), 라벨 없음 → 2.0초 경찰 도착을 뜻하는 화이트 화살표 하나(인원수 표시 안 함)
window.CLIP = {
  file: "L-B32_GFX_floorplan-e_v1_복도-시신표시",
  format: "full",
  duration: 5,
  build(stage, tl) {
    const fp = buildT02(stage, tl, {});
    fp.body(tl, 1.0, [600, 322]);
    fp.arrow(tl, [[150, 750], [150, 660], [250, 440], [430, 330]], 2.0, 0.8);
    K.hold(tl, 5);
  },
};
