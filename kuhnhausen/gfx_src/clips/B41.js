// B41 · L-B41_GFX_label_v2_결혼기념일 · 오버레이 · 4초 (키패드 영상 위, 위치는 최종 영상에 맞춰 조정)
// 버튼 효과음 4번에 맞춰 0.3초 간격으로 옐로우 점 4개 → 2.0초에 T07 큰 글자 "결혼기념일"
window.CLIP = {
  file: "L-B41_GFX_label_v2_결혼기념일",
  format: "overlay",
  duration: 4,
  build(stage, tl) {
    const dots = [0, 1, 2, 3].map((i) => {
      const d = K.div(stage, { left: 960 - 105 + i * 70 - 18 + "px", top: "160px", width: "36px", height: "36px", borderRadius: "50%",
        border: "3px solid var(--yellow)", background: "rgba(11,11,11,0.5)" });
      tl.to(d, { background: "#FFD400", duration: 0.08 }, 0.8 + i * 0.3);
      return d;
    });
    const t7 = buildT07(stage, tl, { pos: "center", centerY: 290, big: { text: "결혼기념일", at: 2.0, dur: 0.4 } });
    K.hold(tl, 4);
  },
};
