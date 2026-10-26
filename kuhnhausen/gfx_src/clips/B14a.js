// B14-a · L-B14_GFX_floorplan-a_v2_평면도-등장 · T02 · 풀프레임 · 4초
// 침입자의 이름은 B33 전까지 쓰지 않는다 → '남자'
window.CLIP = {
  file: "L-B14_GFX_floorplan-a_v2_평면도-등장",
  format: "full",
  duration: 4,
  build(stage, tl) {
    const fp = buildT02(stage, tl, { drawAt: 0 });
    fp.person("man", "남자", 1.5, [740, 160]);
    fp.person("susan", "수전", 1.5, [645, 320]);
    fp.move(tl, "man", [[655, 255]], 2.5, 0.35, "power3.in");
    K.hold(tl, 4);
  },
};
