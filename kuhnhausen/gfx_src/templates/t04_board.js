// T04 증거 보드: 블랙 바탕 + 옅은 격자, 카드(화이트 테두리 + 옐로우 핀), 카드끼리 레드 실(2px)
// 보드 위 카드와 실은 여기 한 곳에 정해 두고, 클립마다 "이미 있는 것"과 "새로 붙는 것"만 고른다.
// buildT04(stage, tl, { have: [...ids], add: [{id, at}], cam: {s, cx, cy} })
//   id: 카드(A, B, M, H, C, Q) 또는 실('A-B', 'M-H', 'Q-M', 'Q-H')
//   api.cam(tl, at, dur, {s, cx, cy}), api.flipQ(tl, at)
(function () {
  const CARDS = {
    A: { x: 120, y: 150, w: 320, h: 210, title: "경보 비밀번호", sub: "남편이 알고 있었다" },
    B: { x: 120, y: 560, w: 320, h: 150, title: "낮 경보 해제" },
    M: { x: 560, y: 150, w: 300, h: 310, photo: true, title: "마이크(남편)" },
    M2: { x: 560, y: 150, w: 300, h: 350, photo: true, title: "마이크", sub: "수첩 메모 · 남편 이름" },
    H: { x: 1060, y: 150, w: 300, h: 310, photo: true, title: "해피" },
    C: { x: 1060, y: 580, w: 300, h: 150, title: "살인 공모 전과" },
    Q: { x: 1500, y: 420, w: 300, h: 310, photo: true, title: "옛 감방 동료", unknown: true },
  };
  const STRINGS = {
    "A-B": { a: "A", b: "B" },
    "M-H": { a: "M", b: "H", label: "고용: 청소원" },
    "Q-M": { a: "Q", b: "M" },
    "Q-H": { a: "Q", b: "H" },
  };
  const pin = (id) => [CARDS[id].x + CARDS[id].w / 2, CARDS[id].y];

  window.buildT04 = function (stage, tl, cfg = {}) {
    stage.classList.add("full");
    const world = K.div(stage, { left: "0px", top: "0px", width: "1920px", height: "1080px", transformOrigin: "0 0" });
    // 옅은 격자(화이트 6%)
    K.div(world, { left: "-1920px", top: "-1080px", width: "5760px", height: "3240px",
      backgroundImage: "linear-gradient(rgba(242,242,242,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(242,242,242,0.06) 1px, transparent 1px)",
      backgroundSize: "60px 60px" });
    K.bottomMask(stage);
    const strSvg = K.svg(world);       // 실은 카드 밑에 깔린다
    const cardLayer = K.div(world, { left: "0px", top: "0px" });
    const labelLayer = K.div(world, { left: "0px", top: "0px", zIndex: 3 });

    const have = new Set(cfg.have || []);
    const addAt = {};
    (cfg.add || []).forEach((a) => { addAt[a.id] = a.at; });
    const els = {};

    function makeCard(id) {
      const c = CARDS[id];
      const card = K.div(cardLayer, { left: c.x + "px", top: c.y + "px", width: c.w + "px", height: c.h + "px",
        perspective: "900px" });
      const face = (back) => {
        const f = K.div(card, { inset: "0px", background: "var(--black)", border: "3px solid var(--white)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: c.photo ? "flex-start" : "center",
          gap: "12px", padding: c.photo ? "26px 20px 0" : "0 20px", backfaceVisibility: "hidden" });
        if (back) f.style.transform = "rotateY(180deg)";
        return f;
      };
      const front = face(false);
      let back = null;
      const photoSlot = (f, unknown) => {
        const slot = K.div(f, { position: "relative", width: "220px", height: "170px", flex: "0 0 auto",
          border: unknown ? "3px dashed rgba(242,242,242,0.4)" : "none", background: unknown ? "transparent" : "rgba(242,242,242,0.08)" });
        if (unknown) {
          K.div(slot, { inset: "0px", display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--yellow)", fontSize: "130px", fontWeight: "800", lineHeight: "1" }, "?");
        } else {
          const s = K.svg(slot, {}, 220, 170);
          K.person(s, 110, 112, 70, { fill: "#F2F2F2", "fill-opacity": 0.4 });
        }
      };
      const title = (f) => K.div(f, { position: "relative", color: "var(--white)", fontSize: "40px", fontWeight: "800",
        lineHeight: "1.1", textAlign: "center", whiteSpace: "nowrap" }, c.title);
      if (c.unknown) {
        photoSlot(front, true);
        back = face(true);
        photoSlot(back, false);
        title(back);
      } else {
        if (c.photo) photoSlot(front, false);
        title(front);
        if (c.sub) K.div(front, { position: "relative", color: "var(--white)", opacity: 0.75, fontSize: "30px",
          fontWeight: "700", lineHeight: "1", whiteSpace: "nowrap" }, c.sub);
      }
      // 핀
      K.div(card, { left: c.w / 2 - 14 + "px", top: "-14px", width: "28px", height: "28px", borderRadius: "50%",
        background: "var(--yellow)", boxShadow: "0 3px 0 rgba(11,11,11,0.6)", zIndex: 2 });
      return { card, front, back };
    }

    function makeString(id) {
      const s = STRINGS[id];
      const [a, b] = [pin(s.a), pin(s.b)];
      const mx = (a[0] + b[0]) / 2, my = Math.max(a[1], b[1]) + 46;
      const p = K.node(strSvg, "path", { d: `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`, fill: "none",
        stroke: "#E8202A", "stroke-width": 2.5 });
      let label = null;
      if (s.label) {
        label = K.label(labelLayer, s.label, { left: mx, top: Math.min(a[1], b[1]) - 64 });
        gsap.set(label, { xPercent: -50 });
      }
      return { p, label };
    }

    Object.keys(CARDS).forEach((id) => {
      if (!have.has(id) && addAt[id] == null) return;
      els[id] = makeCard(id);
      if (addAt[id] != null) {
        const { card } = els[id];
        gsap.set(card, { opacity: 0, y: -26, scale: 1.08 });
        tl.to(card, { opacity: 1, duration: 0.2 }, addAt[id]);
        tl.to(card, { y: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, addAt[id]);
      }
    });
    Object.keys(STRINGS).forEach((id) => {
      if (!have.has(id) && addAt[id] == null) return;
      els[id] = makeString(id);
      if (addAt[id] != null) {
        K.draw(tl, els[id].p, addAt[id], 0.6, "power2.inOut");
        if (els[id].label) K.inUp(tl, els[id].label, addAt[id] + 0.5, 0.35);
      }
    });
    if (cfg.qFlipped && els.Q) {
      gsap.set(els.Q.front, { rotateY: -180 });
      gsap.set(els.Q.back, { rotateY: 0 });
    }

    function camXY(c) { return { x: 960 - c.cx * c.s, y: 460 - c.cy * c.s, scale: c.s }; }
    gsap.set(world, camXY(Object.assign({ s: 1, cx: 960, cy: 460 }, cfg.cam || {})));

    return {
      world, els, cards: CARDS, strSvg, pin,
      cam(tl, at, dur, c, ease = "power2.inOut") { tl.to(world, Object.assign(camXY(c), { duration: dur, ease }), at); },
      flipQ(tl, at) {
        tl.to(els.Q.front, { rotateY: -180, duration: 0.5, ease: "power2.inOut" }, at);
        gsap.set(els.Q.back, { rotateY: 180 });
        tl.to(els.Q.back, { rotateY: 0, duration: 0.5, ease: "power2.inOut" }, at);
      },
    };
  };
})();
