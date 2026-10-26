// B24 · L-B24_GFX_card_v1_빈-증거카드 · 풀프레임 · 4초 · 빈 카드 두 장(T04 카드 모양)이 천천히 떠오름, 글자 없음
window.CLIP = {
  file: "L-B24_GFX_card_v1_빈-증거카드",
  format: "full",
  duration: 4,
  build(stage, tl) {
    [[560, 0.5], [1060, 1.2]].forEach(([x, at]) => {
      const c = K.div(stage, { left: x + "px", top: "320px", width: "300px", height: "220px", background: "var(--black)",
        border: "3px solid var(--white)" });
      K.div(c, { left: "136px", top: "-17px", width: "28px", height: "28px", borderRadius: "50%", background: "var(--yellow)" });
      gsap.set(c, { opacity: 0, y: 60 });
      tl.to(c, { opacity: 1, duration: 0.6, ease: "power1.out" }, at);
      tl.to(c, { y: 0, duration: 2.6, ease: "power2.out" }, at);
    });
    K.hold(tl, 4);
  },
};
