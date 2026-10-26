// T11 지도: 오리건주 윤곽(화이트 2px), 도시 점(옐로우)과 이름 라벨, 옐로우 경로(돌아오는 길은 점선)
// 지도 데이터: data/oregon.js (us-atlas, 미국 인구조사국 경계)
// buildT11(stage, tl, cfg) -> api, 그리고 매 프레임 api.draw() 호출
//   api.cam  {s, lat, lon}  — gsap으로 트윈
//   api.city(name, lat, lon, labelAt, side)
//   api.route(points, {dashed}) -> 진행값 객체 {p}
//   api.county(id) -> 강조 객체 {w, a}
(function () {
  const S = 165, KX = Math.cos(44.5 * Math.PI / 180);
  const CX = 960, CY = 450;

  function catmull(pts, n = 16) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
          + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  window.buildT11 = function (stage, tl, cfg = {}) {
    stage.classList.add("full");
    const cv = document.createElement("canvas");
    cv.width = 1920; cv.height = 1080;
    Object.assign(cv.style, { position: "absolute", left: "0px", top: "0px" });
    stage.appendChild(cv);
    const ctx = cv.getContext("2d");
    K.bottomMask(stage);
    const layer = K.div(stage, { left: "0px", top: "0px", width: "1920px", height: "1080px", zIndex: 5 });

    const cam = Object.assign({ s: 1, lat: 44.1, lon: -120.55 }, cfg.cam || {});
    const xy = ([lon, lat]) => [CX + (lon - cam.lon) * KX * S * cam.s, CY - (lat - cam.lat) * S * cam.s];
    const outline = { a: cfg.outlineAt != null ? 0 : 1 };
    if (cfg.outlineAt != null) tl.to(outline, { a: 1, duration: 0.6 }, cfg.outlineAt);

    const cities = [], routes = [], counties = [], pins = [];
    const api = {
      cam, xy,
      city(name, lat, lon, labelAt, side = "right", dotAt) {
        const lab = K.div(layer, { left: "0px", top: "0px", background: "var(--black)", color: "var(--white)",
          fontSize: "36px", fontWeight: "800", lineHeight: "1", padding: "8px 14px 10px", whiteSpace: "nowrap" }, name);
        const c = { name, lat, lon, lab, side, dot: { a: dotAt != null ? 0 : 1, blink: 0 } };
        if (dotAt != null) tl.to(c.dot, { a: 1, duration: 0.3 }, dotAt);
        if (labelAt != null) { gsap.set(lab, { opacity: 0 }); tl.to(lab, { opacity: 1, duration: 0.35 }, labelAt); }
        cities.push(c);
        return c;
      },
      route(points, opts = {}) {
        const r = { pts: catmull(points.map(([lat, lon]) => [lon, lat])), p: 0, dashed: !!opts.dashed };
        routes.push(r);
        return r;
      },
      county(id) {
        const c = window.OREGON.counties.find((x) => x.id === id);
        const h = { c, w: 0, a: 0 };
        counties.push(h);
        return h;
      },
      // 화면 요소를 지도 좌표에 붙여 둠 (매 프레임 위치 갱신)
      pinTo(el, lat, lon, dx = 0, dy = 0) { pins.push({ el, lat, lon, dx, dy }); },
      routeEnd(r) {
        const n = Math.max(1, Math.round(r.p * (r.pts.length - 1)));
        return r.pts[n];
      },
      draw() {
        ctx.clearRect(0, 0, 1920, 1080);
        ctx.lineJoin = "round"; ctx.lineCap = "round";
        const poly = (rings) => {
          ctx.beginPath();
          rings.forEach((ring) => ring.forEach((p, i) => { const [x, y] = xy(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }));
        };
        if (cfg.showCounties) {
          ctx.strokeStyle = "rgba(242,242,242,0.13)"; ctx.lineWidth = 1.2;
          window.OREGON.counties.forEach((c) => { poly(c.rings); ctx.stroke(); });
        }
        ctx.strokeStyle = `rgba(242,242,242,${outline.a})`; ctx.lineWidth = 2;
        poly(window.OREGON.state); ctx.stroke();
        counties.forEach((h) => {
          if (h.a <= 0) return;
          ctx.strokeStyle = `rgba(232,32,42,${h.a})`; ctx.lineWidth = h.w;
          poly(h.c.rings); ctx.closePath(); ctx.stroke();
          ctx.fillStyle = `rgba(232,32,42,${0.12 * h.a})`; ctx.fill();
        });
        routes.forEach((r) => {
          if (r.p <= 0) return;
          const n = Math.max(1, Math.round(r.p * (r.pts.length - 1)));
          ctx.strokeStyle = "#FFD400"; ctx.lineWidth = 6;
          ctx.setLineDash(r.dashed ? [16, 14] : []);
          ctx.beginPath();
          r.pts.slice(0, n + 1).forEach((p, i) => { const [x, y] = xy(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
          ctx.stroke();
          ctx.setLineDash([]);
        });
        cities.forEach((c) => {
          const [x, y] = xy([c.lon, c.lat]);
          if (c.dot.a > 0) {
            if (c.dot.blink > 0) {
              ctx.strokeStyle = `rgba(255,212,0,${0.6 * (1 - c.dot.blink)})`; ctx.lineWidth = 4;
              ctx.beginPath(); ctx.arc(x, y, 12 + 36 * c.dot.blink, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.fillStyle = `rgba(255,212,0,${c.dot.a})`;
            ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#0B0B0B"; ctx.lineWidth = 3; ctx.stroke();
          }
          const r = c.lab.getBoundingClientRect();
          const lx = c.side === "left" ? x - 24 - r.width : x + 24;
          c.lab.style.left = lx + "px";
          c.lab.style.top = y - r.height / 2 + "px";
        });
        pins.forEach((p) => {
          const [x, y] = xy([p.lon, p.lat]);
          p.el.style.left = x + p.dx + "px";
          p.el.style.top = y + p.dy + "px";
        });
      },
    };
    return api;
  };
})();
