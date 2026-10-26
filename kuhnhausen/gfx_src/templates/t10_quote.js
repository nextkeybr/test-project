// T10 인용 카드: 가운데 화이트 큰 따옴표 인용(64px), 아래 원문 표시(화이트 50%, 30px, 영어), 아래 라벨(T05)
// buildT10(stage, tl, { quote, original, label, quoteAt, originalAt, labelAt, centerY, band })
//   band: true면 글자 뒤에만 블랙 50% 띠(사진 위에 얹을 때)
(function () {
  window.buildT10 = function (stage, tl, cfg) {
    const wrap = K.div(stage, { left: "50%", top: (cfg.centerY ?? 440) + "px", width: "1600px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "26px",
      padding: cfg.band ? "40px 80px 44px" : "0px", background: cfg.band ? "rgba(11,11,11,0.5)" : "transparent" });
    gsap.set(wrap, { xPercent: -50, yPercent: -50 });
    if (cfg.band) wrap.style.width = "1920px";
    const q = K.div(wrap, { position: "relative", fontSize: "64px", lineHeight: "1.4", fontWeight: "800",
      color: "var(--white)", maxWidth: "1500px" }, `“${cfg.quote}”`);
    const o = K.div(wrap, { position: "relative", fontSize: "30px", lineHeight: "1.4", fontWeight: "700",
      color: "rgba(242,242,242,0.5)", maxWidth: "1500px", wordBreak: "normal" }, cfg.original);
    const l = K.label(wrap, cfg.label, {});
    l.style.position = "relative";
    K.inUp(tl, q, cfg.quoteAt);
    K.inUp(tl, o, cfg.originalAt);
    K.inUp(tl, l, cfg.labelAt ?? cfg.originalAt + 0.3, 0.35);
    if (cfg.band) {
      gsap.set(wrap, { opacity: 0 });
      tl.to(wrap, { opacity: 1, duration: 0.4 }, cfg.quoteAt - 0.2);
    }
    if (cfg.fadeOutAt != null) tl.to(wrap, { opacity: 0, duration: cfg.fadeOutDur ?? 1, ease: "power1.in" }, cfg.fadeOutAt);
    return { wrap, q, o, l };
  };
})();
