// B31-b · L-B31_GFX_floorplan-d_v2_옆집-위치 · T02 · 풀프레임 · 3초
// 줌아웃 → 오른쪽에 옆집 윤곽(화이트 점선)과 라벨 "옆집", 수전 점이 옆집으로 이동한 상태로 끝
window.CLIP = {
  file: "L-B31_GFX_floorplan-d_v2_옆집-위치",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const fp = buildT02(stage, tl, { cam: { s: 1, cx: 550, cy: 320 } });
    fp.cam(tl, 0, 1.0, { s: 0.6, cx: 980, cy: 330 });
    fp.neighbor(tl, 0.8);
    const route = [[520, 320], [150, 330], [150, 720], [1500, 720], [1550, 450]];
    fp.person("susan", "수전", null, route[0]);
    fp.path(tl, route, 1.2, 1.3, { width: 9 });
    fp.move(tl, "susan", route.slice(1), 1.2, 1.3);
    K.hold(tl, 3);
  },
};
