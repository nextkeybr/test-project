// B31-a · L-B31_GFX_card-a_v1_911카드-신고자공개 · T01 · 풀프레임 · 3초
window.CLIP = {
  file: "L-B31_GFX_card-a_v1_911카드-신고자공개",
  format: "full",
  duration: 3,
  build(stage, tl) {
    // B02의 첫 줄 상태로 시작
    const card = buildT01(stage, tl, {
      label: "911 녹취록 · 보도 인용",
      lines: [{ speaker: "신고자", text: "…침입자가 있어요.", state: "shown" }],
      speech: [[-3.0, -1.7]],
    });
    const { row, tag, txt } = card.lines[0].el;

    // 0.5초: 이름표가 뒤집히며 '신고자' → '이웃'
    row.style.position = "relative";
    const tag2 = tag.cloneNode();
    tag2.textContent = "이웃";
    Object.assign(tag2.style, { position: "absolute", left: "0px", top: "0px" });
    row.appendChild(tag2);
    gsap.set([tag, tag2], { transformPerspective: 500 });
    gsap.set(tag2, { rotateX: -90 });
    tl.to(tag, { rotateX: 90, duration: 0.16, ease: "power2.in" }, 0.5);
    tl.to(tag2, { rotateX: 0, duration: 0.2, ease: "power2.out" }, 0.66);

    // 1.2초: 말줄임표 자리에 '옆집에'가 채워져 "옆집에 침입자가 있어요."
    txt.textContent = "";
    const span = (s) => {
      const e = document.createElement("span");
      e.textContent = s;
      Object.assign(e.style, { display: "inline-block", whiteSpace: "nowrap", overflow: "hidden", verticalAlign: "top" });
      txt.appendChild(e);
      return e;
    };
    const ell = span("…");
    const ins = span("옆집에 ");
    txt.appendChild(document.createTextNode("침입자가 있어요."));
    const w1 = ell.getBoundingClientRect().width, w2 = ins.getBoundingClientRect().width;
    gsap.set(ell, { width: w1 });
    gsap.set(ins, { width: 0 });
    tl.to(ell, { width: 0, opacity: 0, duration: 0.25, ease: "power2.in" }, 1.2);
    tl.to(ins, { width: w2, duration: 0.5, ease: "power3.out" }, 1.3);
    K.hold(tl, 3);
    return (t) => card.wave.draw(t);
  },
};
