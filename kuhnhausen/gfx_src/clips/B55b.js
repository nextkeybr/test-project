// B55 · L-B55_GFX_board-c2_v1_빨간실-클로즈업 · T04 · 풀프레임 · 3초
// 남편 카드와 해피 카드 사이 빨간 실만 크게. 0~1초 느슨한 실 → 1.2초 팽팽해짐(짧은 진동) → 정지
window.CLIP = {
  file: "L-B55_GFX_board-c2_v1_빨간실-클로즈업",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const b = buildT04(stage, tl, { have: ["A", "B", "M", "H", "A-B"], cam: { s: 2.2, cx: 960, cy: 230 } });
    const [a, z] = [b.pin("M"), b.pin("H")];
    const str = K.node(b.strSvg, "path", { fill: "none", stroke: "#E8202A", "stroke-width": 2.5 });
    const S = { sag: 130 };
    tl.to(S, { sag: 110, duration: 1.0, ease: "sine.inOut" }, 0);
    tl.to(S, { sag: -14, duration: 0.2, ease: "power3.in" }, 1.0);
    [[9, 0.08], [-5, 0.08], [3, 0.07], [0, 0.07]].forEach(([v, d], i, arr) => {
      tl.to(S, { sag: v, duration: d, ease: "sine.inOut" }, 1.2 + arr.slice(0, i).reduce((s, x) => s + x[1], 0));
    });
    K.hold(tl, 3);
    return () => {
      const mx = (a[0] + z[0]) / 2;
      str.setAttribute("d", `M ${a[0]} ${a[1]} Q ${mx} ${a[1] + S.sag * 2} ${z[0]} ${z[1]}`);
    };
  },
};
