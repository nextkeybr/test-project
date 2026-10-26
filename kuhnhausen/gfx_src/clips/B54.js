// B54 · L-B54_GFX_diagram_v2_배낭-물건 · 풀프레임 · 6초
// 위에서 내려다본 배낭과 물건 아이콘(화이트 선 그림) → 3.5초 "서류 봉투"만 옐로우 + "새 휴대전화 번호"와 흐린 숫자 자리
window.CLIP = {
  file: "L-B54_GFX_diagram_v2_배낭-물건",
  format: "full",
  duration: 6,
  build(stage, tl) {
    const svg = K.svg(stage);
    const L = { fill: "none", stroke: "#F2F2F2", "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" };
    // 배낭(위에서 본 모습, 열린 상태)
    const bag = K.node(svg, "g", L);
    K.node(bag, "rect", { x: 850, y: 120, width: 220, height: 230, rx: 40 });
    K.node(bag, "path", { d: "M 880 170 Q 960 130 1040 170 M 890 250 h 140 v 70 h -140 Z M 900 120 v -30 h 120 v 30" });
    K.inUp(tl, bag, 0.1);
    const icons = {
      syrup: "M -22 -60 h 44 v 20 l 14 22 v 78 h -72 v -78 l 14 -22 Z M -22 -78 h 44 v 18 h -44 Z M -36 0 h 72",
      cash: "M -62 -38 h 124 v 76 h -124 Z M -50 -50 h 124 v 76 M 0 0 m -16 0 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0",
      pills: "M -34 -40 h 68 v 92 h -68 Z M -40 -62 h 80 v 22 h -80 Z M 0 -12 v 40 M -20 8 h 40",
      notebook: "M -46 -62 h 92 v 124 h -92 Z M -46 -40 h -14 M -46 -10 h -14 M -46 20 h -14 M -46 50 h -14 M -24 -30 h 50 M -24 -6 h 50",
      stub: "M -44 -62 h 88 v 124 l -11 -8 l -11 8 l -11 -8 l -11 8 l -11 -8 l -11 8 l -11 -8 l -11 8 Z M -26 -36 h 52 M -26 -14 h 52 M -26 8 h 30",
      envelope: "M -66 -44 h 132 v 88 h -132 Z M -66 -44 L 0 8 L 66 -44",
    };
    const items = [["syrup", "초콜릿 시럽"], ["cash", "현금 200달러"], ["pills", "당뇨약"], ["notebook", "수첩"], ["stub", "급여 명세서"], ["envelope", "서류 봉투"]];
    const gx = (i) => 230 + i * 292;
    let envG, envLab;
    items.forEach(([k, name], i) => {
      const g = K.node(svg, "g", Object.assign({}, L));
      K.node(g, "path", { d: icons[k] });
      gsap.set(g, { x: 960, y: 240, scale: 0.4, opacity: 0 });
      const at = 0.5 + i * 0.42;
      tl.to(g, { opacity: 1, duration: 0.15 }, at);
      tl.to(g, { x: gx(i), y: 560, scale: 1, duration: 0.55, ease: "power3.out" }, at);
      const lab = K.div(stage, { left: gx(i) + "px", top: "660px", color: "var(--white)", fontSize: "40px", fontWeight: "800",
        lineHeight: "1", whiteSpace: "nowrap" }, name);
      gsap.set(lab, { xPercent: -50 });
      K.inUp(tl, lab, at + 0.3, 0.35);
      if (k === "envelope") { envG = g; envLab = lab; }
    });
    tl.to(envG, { attr: { stroke: "#FFD400" }, duration: 0.25 }, 3.5);
    tl.to(envLab, { color: "#FFD400", duration: 0.25 }, 3.5);
    const tag = K.label(stage, "새 휴대전화 번호", { left: gx(5), top: 390 }, "mid");
    gsap.set(tag, { xPercent: -50 });
    K.inUp(tl, tag, 3.7, 0.35);
    // 흐리게 처리한 숫자 자리(읽을 수 없는 막대)
    const blur = K.div(stage, { left: gx(5) - 110 + "px", top: "460px", width: "220px", height: "34px", display: "flex", gap: "10px",
      filter: "blur(5px)" });
    [40, 56, 40, 70].forEach((w) => K.div(blur, { position: "relative", width: w + "px", height: "34px", background: "rgba(242,242,242,0.55)" }));
    gsap.set(blur, { opacity: 0 });
    tl.to(blur, { opacity: 1, duration: 0.3 }, 3.9);
    K.hold(tl, 6);
  },
};
