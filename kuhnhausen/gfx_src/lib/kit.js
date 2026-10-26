// 클립 공통 도구: 요소 만들기, 등장/퇴장, 선 그리기, 라벨·말풍선
// 모든 움직임은 GSAP 타임라인(tl)에 시각(초)으로 넣는다. 렌더러가 tl.seek(t)로 프레임을 고른다.
(function () {
  const SVGNS = "http://www.w3.org/2000/svg";
  const K = {
    W: 1920, H: 1080, SAFE: 80, SUB_TOP: 880,

    div(parent, style = {}, text) {
      const d = document.createElement("div");
      Object.assign(d.style, { position: "absolute" }, style);
      if (text != null) d.textContent = text;
      parent.appendChild(d);
      return d;
    },

    svg(parent, style = {}, w = 1920, h = 1080) {
      const s = document.createElementNS(SVGNS, "svg");
      s.setAttribute("width", w);
      s.setAttribute("height", h);
      s.setAttribute("viewBox", `0 0 ${w} ${h}`);
      Object.assign(s.style, { position: "absolute", left: "0px", top: "0px", overflow: "visible" }, style);
      parent.appendChild(s);
      return s;
    },

    node(svg, tag, attrs = {}) {
      const n = document.createElementNS(SVGNS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      svg.appendChild(n);
      return n;
    },

    // 선이 그려지듯 (stroke-dashoffset)
    draw(tl, path, at, dur = 0.6, ease = "power2.inOut") {
      const len = path.getTotalLength();
      // 그리기 전에는 숨김(둥근·사각 선 끝이 점으로 미리 보이지 않게)
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      tl.set(path, { opacity: 1 }, at);
      tl.to(path, { strokeDashoffset: 0, duration: dur, ease }, at);
      return path;
    },

    // 아래에서 12px 올라오며 페이드
    inUp(tl, el, at, dur = 0.45) {
      gsap.set(el, { opacity: 0, y: 12 });
      tl.to(el, { opacity: 1, y: 0, duration: dur, ease: "power3.out" }, at);
      return el;
    },

    // 왼쪽에서 오른쪽으로 마스크가 걷힘
    wipe(tl, el, at, dur = 0.45) {
      gsap.set(el, { clipPath: "inset(-10% 100% -10% 0%)" });
      tl.to(el, { clipPath: "inset(-10% 0% -10% 0%)", duration: dur, ease: "power3.out" }, at);
      return el;
    },

    pop(tl, el, at, dur = 0.4, from = 1.05) {
      gsap.set(el, { opacity: 0, scale: from });
      tl.to(el, { opacity: 1, duration: Math.min(0.25, dur), ease: "power2.out" }, at);
      tl.to(el, { scale: 1, duration: dur, ease: "power3.out" }, at);
      return el;
    },

    out(tl, els, at, dur = 0.28) {
      tl.to(els, { opacity: 0, y: -8, duration: dur, ease: "power2.in" }, at);
    },

    // 말자막 자리(y 880~1080)를 비우는 가림막. 배경 격자·지도선·벽선이 아래로 넘어가지 않게(풀프레임 템플릿용)
    bottomMask(stage) {
      return K.div(stage, { left: "0px", top: "856px", width: "1920px", height: "224px", zIndex: 4,
        background: "linear-gradient(rgba(11,11,11,0) 0px, #0B0B0B 24px)" });
    },

    // 타임라인 길이를 클립 길이에 맞춤
    hold(tl, t) { tl.set({}, {}, t); },

    // T05 고정 라벨. pos: {left, top} 또는 {right, top}. size: 'base'(30px/44px) | 'big'
    label(stage, text, pos = { left: 80, top: 60 }, size = "base") {
      const el = K.div(stage, {}, text);
      el.className = "t05";
      if (size === "big") Object.assign(el.style, { height: "76px", padding: "0 26px", fontSize: "52px" });
      if (size === "mid") Object.assign(el.style, { height: "58px", padding: "0 20px", fontSize: "40px" });
      for (const k in pos) el.style[k] = typeof pos[k] === "number" ? pos[k] + "px" : pos[k];
      return el;
    },

    // 블랙 바탕 + 화이트 글자 칩 (영상 위에서 읽히도록)
    chip(stage, text, pos, size = 40) {
      return K.div(stage, Object.assign({ background: "var(--black)", color: "var(--white)", fontSize: size + "px",
        fontWeight: "700", lineHeight: "1", padding: "12px 20px 14px", whiteSpace: "nowrap" }, K.px(pos)), text);
    },

    // 말풍선: 화이트 바탕 + 블랙 글자, 꼬리 방향 tail: 'left' | 'right' | 'down-left' | 'down-right'
    bubble(stage, text, pos, tail = "down-left", size = 48) {
      const b = K.div(stage, Object.assign({ background: "var(--white)", color: "var(--black)", fontSize: size + "px",
        fontWeight: "800", lineHeight: "1.2", padding: "24px 36px 26px", borderRadius: "28px", whiteSpace: "nowrap" }, K.px(pos)), text);
      const t = K.div(b, { width: "0", height: "0", borderStyle: "solid" });
      if (tail === "down-left") Object.assign(t.style, { left: "48px", bottom: "-26px", borderWidth: "28px 28px 0 0", borderColor: "var(--white) transparent transparent transparent" });
      if (tail === "down-right") Object.assign(t.style, { right: "48px", bottom: "-26px", borderWidth: "28px 0 0 28px", borderColor: "var(--white) transparent transparent transparent" });
      if (tail === "left") Object.assign(t.style, { left: "-26px", top: "50%", marginTop: "-16px", borderWidth: "16px 28px 16px 0", borderColor: "transparent var(--white) transparent transparent" });
      if (tail === "right") Object.assign(t.style, { right: "-26px", top: "50%", marginTop: "-16px", borderWidth: "16px 0 16px 28px", borderColor: "transparent transparent transparent var(--white)" });
      return b;
    },

    px(o = {}) {
      const r = {};
      for (const k in o) r[k] = typeof o[k] === "number" && k !== "opacity" && k !== "zIndex" ? o[k] + "px" : o[k];
      return r;
    },

    // 결정적 난수
    hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); },

    // 사람 실루엣(머리+어깨), 사진 자리용. (cx, cy)는 어깨 윗선 가운데, s는 크기
    person(svg, cx, cy, s, attrs) {
      const g = K.node(svg, "g", attrs);
      K.node(g, "path", { d: `M ${cx - 0.9 * s} ${cy + 0.9 * s} C ${cx - 0.9 * s} ${cy + 0.25 * s} ${cx - 0.55 * s} ${cy} ${cx} ${cy}
        C ${cx + 0.55 * s} ${cy} ${cx + 0.9 * s} ${cy + 0.25 * s} ${cx + 0.9 * s} ${cy + 0.9 * s} Z` });
      K.node(g, "ellipse", { cx, cy: cy - 0.5 * s, rx: 0.36 * s, ry: 0.42 * s });
      return g;
    },
  };
  window.K = K;
})();
