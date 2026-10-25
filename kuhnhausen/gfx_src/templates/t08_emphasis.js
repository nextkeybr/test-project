// T08 강조 자막: 레드 바탕 + 화이트 글자 64px + 화이트 테두리 3px, 105% → 100%로 등장
// buildT08(stage, tl, { text, at, centerY }) -> element
(function () {
  window.buildT08 = function (stage, tl, cfg) {
    const el = document.createElement("div");
    el.textContent = cfg.text;
    Object.assign(el.style, {
      position: "absolute", left: "50%", top: (cfg.centerY ?? 540) + "px",
      background: "var(--red)", color: "var(--white)", border: "3px solid var(--white)",
      fontSize: "64px", fontWeight: "800", lineHeight: "1", padding: "26px 48px 28px",
      whiteSpace: "nowrap",
    });
    stage.appendChild(el);
    gsap.set(el, { xPercent: -50, yPercent: -50, opacity: 0, scale: 1.05 });
    tl.to(el, { opacity: 1, duration: 0.2, ease: "power2.out" }, cfg.at);
    tl.to(el, { scale: 1, duration: 0.4, ease: "power3.out" }, cfg.at);
    return el;
  };
})();
