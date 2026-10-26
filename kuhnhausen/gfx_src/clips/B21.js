// B21 · L-B21_GFX_floorplan-b_v2_침실에서-복도로 · T02 · 풀프레임 · 6초
// 침실 줌 상태 → 1.0초 수전 점이 침실 문 쪽으로(옐로우 경로선) → 3.0초 복도로 나감 → 4.0초 줌아웃해 집 전체
window.CLIP = {
  file: "L-B21_GFX_floorplan-b_v2_침실에서-복도로",
  format: "full",
  duration: 6,
  build(stage, tl) {
    const fp = buildT02(stage, tl, { cam: { s: 1.8, cx: 780, cy: 200 } });
    const route = [[800, 170], [700, 215], [645, 260], [600, 320], [520, 322]];
    fp.path(tl, route, 1.0, 2.0);
    fp.person("man", "남자", null, [900, 210]);
    fp.person("susan", "수전", null, route[0]);
    fp.move(tl, "susan", route.slice(1), 1.0, 2.0);
    fp.move(tl, "man", [[760, 190], [690, 250], [660, 320]], 1.4, 2.0);
    fp.cam(tl, 4.0, 1.4, { s: 1, cx: 550, cy: 320 });
    K.hold(tl, 6);
  },
};
