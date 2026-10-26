// T09 문서 하이라이트
// 원본 캡처 이미지가 아직 없어서, 지시문 6장의 대체안대로 "문장만 T09 카드로(형광펜 없이)" 만든다.
// 캡처가 들어오면 cfg.img 와 문장별 hl(하이라이트 좌표)을 넣어 v2로 다시 뽑는다.
// buildT09(stage, tl, cfg)
//   cfg.sentences [{en, ko, at, koAt}]  원문 문장(원문 표시)과 번역 자막, 등장 시각
//   cfg.source                     출처 라벨 문구(T05)
//   cfg.sourceAt                   출처 라벨 등장 시각
//   cfg.box                        {left, top, width} 종이 영역 (기본: 가운데)
//   cfg.mini                       true면 축소판(다른 화면 오른쪽 아래에 얹을 때)
//   cfg.enSize                     원문 글자 크기(기본 48, 축소판 30)
(function () {
  window.buildT09 = function (stage, tl, cfg) {
    const mini = !!cfg.mini;
    const box = cfg.box || { left: 260, top: 170, width: 1400 };
    const root = K.div(stage, { left: "0px", top: "0px", width: "1920px", height: "1080px" });

    // 종이(문서) — 화이트 바탕에 블랙 글자
    const paper = K.div(root, Object.assign({ background: "var(--white)", color: "var(--black)",
      padding: mini ? "26px 32px" : "56px 72px", display: "flex", flexDirection: "column", gap: mini ? "14px" : "28px" }, K.px(box)));
    const enEls = cfg.sentences.map((s) => K.div(paper, { position: "relative", fontSize: (cfg.enSize ?? (mini ? 30 : 48)) + "px",
      lineHeight: "1.35", fontWeight: "700", wordBreak: "normal" }, s.en));

    // 번역 자막 — 블랙 바 + 화이트 글자, 종이 바로 아래
    const subWrap = K.div(root, { left: box.left + "px", width: box.width + "px", display: "flex", justifyContent: "center" });
    const koEls = cfg.sentences.map((s) => K.div(subWrap, { background: "var(--black)", color: "var(--white)",
      fontSize: mini ? "34px" : "48px", fontWeight: "700", lineHeight: "1", padding: mini ? "14px 20px 16px" : "20px 32px 22px",
      border: "2px solid rgba(242,242,242,0.35)", whiteSpace: "nowrap" }, s.ko));
    // 레이아웃이 정해진 뒤 자막 위치를 종이 아래에 붙임
    // 종이 + 번역 자막 묶음을 화면 위쪽 영역(y 80~860) 가운데에 놓는다(축소판은 지정 위치 그대로)
    const gap = mini ? 14 : 28;
    if (!mini) {
      const ph = paper.getBoundingClientRect().height, sh = koEls[0].getBoundingClientRect().height;
      paper.style.top = Math.round(440 - (ph + gap + sh) / 2) + "px";
    }
    const pr = paper.getBoundingClientRect();
    subWrap.style.top = pr.bottom + gap + "px";

    gsap.set(paper, { opacity: 0, y: 16 });
    tl.to(paper, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, cfg.paperAt ?? 0.1);

    cfg.sentences.forEach((s, i) => {
      K.inUp(tl, enEls[i], s.at);
      gsap.set(koEls[i], { position: i ? "absolute" : "relative" });
      K.inUp(tl, koEls[i], s.koAt ?? s.at + 0.25, 0.4);
      if (i > 0) {
        // 앞 문장은 옅게, 앞 번역은 사라짐
        tl.to(enEls.slice(0, i), { opacity: 0.35, duration: 0.35 }, s.at);
        tl.to(koEls[i - 1], { opacity: 0, duration: 0.25 }, s.at);
      }
    });

    let src = null;
    if (cfg.source) {
      src = K.label(root, cfg.source, mini ? { left: box.left, top: pr.top - 56 } : { right: 80, top: 816 });
      K.inUp(tl, src, cfg.sourceAt ?? 0.6, 0.35);
    }
    return { root, paper, enEls, koEls, src };
  };
})();
