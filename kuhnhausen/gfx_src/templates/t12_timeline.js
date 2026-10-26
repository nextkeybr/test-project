// T12 타임라인·달력
// buildTimeline(parent, tl, { y, x1, x2, lineAt, points: [{id, x, label, at, below}] }) -> api
//   가로 화이트 선 위에 옐로우 점과 라벨. api.add(point) 로 나중에 점 추가, api.bar(tl, xa, xb, label, at)
// buildCalendar(parent, tl, { year, month, x, y, header, at }) -> api
//   블랙 바탕 월 달력. api.fill(tl, day, at, level) 날짜 칸을 옐로우로 채움, api.note(tl, day, text, at)
(function () {
  window.buildTimeline = function (parent, tl, cfg) {
    const root = K.div(parent, { left: "0px", top: "0px", width: "1920px", height: "1080px" });
    const line = K.div(root, { left: cfg.x1 + "px", top: cfg.y - 1.5 + "px", width: cfg.x2 - cfg.x1 + "px", height: "3px",
      background: "var(--white)", transformOrigin: "left center" });
    if (cfg.lineAt != null) { gsap.set(line, { scaleX: 0 }); tl.to(line, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, cfg.lineAt); }
    const size = cfg.size ?? 40;
    const pts = {};
    const api = {
      root, line,
      add(p) {
        const dot = K.div(root, { left: p.x - 15 + "px", top: cfg.y - 15 + "px", width: "30px", height: "30px",
          borderRadius: "50%", background: "var(--yellow)", border: "4px solid var(--black)" });
        const lab = K.div(root, { left: p.x + "px", top: (p.below ? cfg.y + 34 : cfg.y - 34 - size) + "px",
          color: "var(--yellow)", fontSize: size + "px", fontWeight: "800", lineHeight: "1", whiteSpace: "nowrap" }, p.label);
        gsap.set(lab, { xPercent: p.align === "left" ? 0 : p.align === "right" ? -100 : -50 });
        if (p.at != null) {
          gsap.set(dot, { scale: 0 });
          tl.to(dot, { scale: 1, duration: 0.35, ease: "back.out(2.5)" }, p.at);
          K.inUp(tl, lab, p.at + 0.1);
        }
        pts[p.id || p.label] = { dot, lab };
        return { dot, lab };
      },
      bar(tl, xa, xb, label, at, labelAt) {
        const b = K.div(root, { left: xa + "px", top: cfg.y - 34 + "px", width: xb - xa + "px", height: "14px",
          background: "var(--yellow)", opacity: 0.85, transformOrigin: "left center" });
        const l = K.div(root, { left: (xa + xb) / 2 + "px", top: cfg.y - 50 - size + "px", color: "var(--white)",
          fontSize: size + "px", fontWeight: "800", lineHeight: "1", whiteSpace: "nowrap" }, label);
        gsap.set(l, { xPercent: -50 });
        if (at != null) {
          gsap.set(b, { scaleX: 0 });
          tl.to(b, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, at);
          K.inUp(tl, l, labelAt ?? at + 0.6);
        }
        return { b, l };
      },
      pts,
    };
    (cfg.points || []).forEach((p) => api.add(p));
    return api;
  };

  window.buildCalendar = function (parent, tl, cfg) {
    const CW = cfg.cw ?? 128, CH = cfg.ch ?? 92;
    const root = K.div(parent, { left: cfg.x + "px", top: cfg.y + "px", width: CW * 7 + "px" });
    const first = new Date(Date.UTC(cfg.year, cfg.month - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(cfg.year, cfg.month, 0)).getUTCDate();
    const head = K.div(root, { left: "0px", top: "0px", color: "var(--yellow)", fontSize: "52px", fontWeight: "800",
      lineHeight: "1" }, cfg.header ?? `${cfg.year}년 ${cfg.month}월`);
    ["일", "월", "화", "수", "목", "금", "토"].forEach((d, i) => {
      K.div(root, { left: i * CW + "px", top: "84px", width: CW + "px", textAlign: "center", color: "var(--white)",
        opacity: 0.6, fontSize: "30px", fontWeight: "700", lineHeight: "1" }, d);
    });
    const gridTop = 136;
    const cells = {};
    for (let d = 1; d <= days; d++) {
      const i = first + d - 1;
      const x = (i % 7) * CW, y = gridTop + Math.floor(i / 7) * CH;
      const cell = K.div(root, { left: x + 4 + "px", top: y + 4 + "px", width: CW - 8 + "px", height: CH - 8 + "px",
        border: "2px solid rgba(242,242,242,0.25)" });
      const fill = K.div(cell, { inset: "-2px", background: "var(--yellow)", opacity: 0 });
      const num = K.div(cell, { left: "14px", top: "10px", color: "var(--white)", fontSize: "40px", fontWeight: "800",
        lineHeight: "1" }, String(d));
      cells[d] = { cell, fill, num, x: cfg.x + x + CW / 2, y: cfg.y + y + 4 };
    }
    if (cfg.at != null) K.inUp(tl, root, cfg.at, 0.5);
    return {
      root, cells, head, rows: Math.ceil((first + days) / 7), gridTop, CW, CH,
      setFill(d, level = 1) {
        gsap.set(cells[d].fill, { opacity: level });
        gsap.set(cells[d].num, { color: level >= 0.9 ? "#0B0B0B" : "#F2F2F2" });
      },
      fill(tl, d, at, level = 1, dur = 0.18) {
        const c = cells[d];
        tl.to(c.fill, { opacity: level, duration: dur, ease: "power2.out" }, at);
        tl.to(c.num, { color: level >= 0.9 ? "#0B0B0B" : "#F2F2F2", duration: dur }, at);
      },
      // 날짜 칸 오른쪽, 달력 바깥에 라벨 + 옐로우 지시선(날짜 숫자를 가리지 않게)
      note(tl, d, text, at) {
        const c = cells[d];
        const cy = c.y + CH - 24; // 숫자 아래쪽을 지나가게
        const x0 = c.x + CW / 2 - 4, x1 = cfg.x + CW * 7 + 36;
        const line = K.div(parent, { left: x0 + "px", top: cy - 1.5 + "px", width: x1 - x0 + "px", height: "3px",
          background: "var(--yellow)", transformOrigin: "left center" });
        const l = K.label(parent, text, { left: x1, top: cy - 29 }, "mid");
        gsap.set(line, { scaleX: 0 });
        tl.to(line, { scaleX: 1, duration: 0.3, ease: "power2.out" }, at);
        K.inUp(tl, l, at + 0.15);
        return l;
      },
    };
  };
})();
