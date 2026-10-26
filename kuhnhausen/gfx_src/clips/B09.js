// B09 · L-B09_GFX_label_v1_쪽지-번역 · 오버레이 · 7초
// 재생성 이미지의 쪽지 위치에 맞춰야 하므로 지금은 가운데 기준. 최종 이미지가 나오면 위치만 옮겨 v2로
// 글꼴: 나눔손글씨 펜(Nanum Pen Script, OFL 오픈 라이선스)
window.CLIP = {
  file: "L-B09_GFX_label_v1_쪽지-번역",
  format: "overlay",
  duration: 7,
  hand: "수, 잠을 못 자서바닷가에 좀 다녀올게.",
  build(stage, tl) {
    K.inUp(tl, K.label(stage, "재연"), 0.2, 0.35);
    const note = K.div(stage, { left: "50%", top: "420px", fontFamily: "'Nanum Pen Script'", fontWeight: "400",
      fontSize: "96px", lineHeight: "1.15", color: "var(--black)", whiteSpace: "nowrap" });
    gsap.set(note, { xPercent: -50, yPercent: -50, rotation: -3 });
    const l1 = K.div(note, { position: "relative" }, "수, 잠을 못 자서");
    const l2 = K.div(note, { position: "relative" }, "바닷가에 좀 다녀올게.");
    // 1.0초부터 2초 동안 글씨가 써지듯 드러남
    for (const [el, at] of [[l1, 1.0], [l2, 2.0]]) {
      gsap.set(el, { clipPath: "inset(-20% 100% -20% 0%)" });
      tl.to(el, { clipPath: "inset(-20% 0% -20% 0%)", duration: 1.0, ease: "none" }, at);
    }
    K.out(tl, [...stage.children], 6.7);
    K.hold(tl, 7);
  },
};
