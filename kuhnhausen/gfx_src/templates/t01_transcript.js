// T01 911 녹취 카드
// buildT01(stage, tl, cfg) -> { lines, wave }
//   cfg.label      오른쪽 위 라벨 문구
//   cfg.lines      [{ speaker, text, at, state }]  state: 'shown'(시작부터 보임) | undefined(at 초에 등장)
//   cfg.speech     [[시작, 끝], ...]  파형이 말소리처럼 커지는 구간(초)
//   cfg.flatAt     파형이 뚝 멈추는 시각(초). 없으면 끝까지 움직임
//   cfg.dimOld     새 줄이 생길 때 윗줄 투명도 (기본 0.6)
(function () {
  const WAVE_W = 1200, WAVE_H = 150, WAVE_Y = 110;
  const BAR_W = 4, BAR_GAP = 4, BARS = WAVE_W / (BAR_W + BAR_GAP);
  const PX_PER_SEC = (BAR_W + BAR_GAP) * 30; // 한 프레임에 막대 하나씩 흐름

  // 시간에 대해 결정적인 난수(같은 t면 같은 그림)
  function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  function makeWave(stage, cfg) {
    const cv = document.createElement("canvas");
    cv.width = WAVE_W; cv.height = WAVE_H;
    Object.assign(cv.style, { position: "absolute", left: (1920 - WAVE_W) / 2 + "px", top: WAVE_Y + "px" });
    stage.appendChild(cv);
    const ctx = cv.getContext("2d");
    const speech = cfg.speech || [];
    const flatAt = cfg.flatAt ?? Infinity;

    // τ 시점의 말소리 세기(0~1). 구간 가장자리는 부드럽게.
    function voice(tau) {
      let v = 0.1 + 0.08 * hash(Math.floor(tau * 30) + 0.5); // 전화선 잡음
      for (const [a, b] of speech) {
        if (tau > a - 0.15 && tau < b + 0.15) {
          const edge = Math.min(1, (tau - (a - 0.15)) / 0.15, ((b + 0.15) - tau) / 0.15);
          const syl = 0.35 + 0.65 * Math.abs(Math.sin(tau * Math.PI * 4.3 + hash(Math.floor(tau * 3)) * 6));
          v = Math.max(v, edge * syl);
        }
      }
      return v;
    }

    return {
      reveal: 1, // 0~1, 가운데서 양옆으로 펼쳐지는 정도
      draw(t) {
        ctx.clearRect(0, 0, WAVE_W, WAVE_H);
        const mid = WAVE_H / 2;
        const flat = t >= flatAt;
        const half = (BARS / 2) * this.reveal;
        ctx.fillStyle = "#F2F2F2";
        if (flat) {
          // 통화가 끊김: 이어진 평평한 선 하나
          const w = WAVE_W * this.reveal;
          ctx.fillRect((WAVE_W - w) / 2, mid - 1.5, w, 3);
          return;
        }
        for (let i = 0; i < BARS; i++) {
          if (Math.abs(i + 0.5 - BARS / 2) > half) continue;
          const tau = t - (BARS - 1 - i) / 30;
          const frame = Math.floor(tau * 30);
          const a = voice(tau) * (0.55 + 0.45 * hash(frame));
          const h = Math.max(3, a * (WAVE_H - 10));
          // 왼쪽(오래된 소리)으로 갈수록 옅게
          ctx.globalAlpha = 0.25 + 0.75 * Math.min(1, i / (BARS * 0.35));
          ctx.fillRect(i * (BAR_W + BAR_GAP), mid - h / 2, BAR_W, h);
        }
        ctx.globalAlpha = 1;
      },
    };
  }

  function makeLine(list, line) {
    const row = document.createElement("div");
    row.className = "t01-row";
    const tag = document.createElement("div");
    tag.className = "t01-tag";
    tag.textContent = line.speaker;
    const txt = document.createElement("div");
    txt.className = "t01-text";
    let mark = null;
    const i = line.mark ? line.text.indexOf(line.mark.text) : -1;
    if (i >= 0) {
      mark = document.createElement("span");
      mark.textContent = line.mark.text;
      txt.append(line.text.slice(0, i), mark, line.text.slice(i + line.mark.text.length));
    } else {
      txt.textContent = line.text;
    }
    row.append(tag, txt);
    list.appendChild(row);
    return { row, tag, txt, mark };
  }

  window.buildT01 = function (stage, tl, cfg) {
    const style = document.createElement("style");
    style.textContent = `
      .t01-list { position: absolute; left: 260px; top: 340px; width: 1400px;
        display: flex; flex-direction: column; gap: 26px; }
      .t01-row { display: flex; align-items: flex-start; gap: 28px; }
      .t01-tag { flex: 0 0 auto; width: 132px; height: 56px; display: flex; align-items: center; justify-content: center;
        background: var(--yellow); color: var(--black); font-size: 32px; font-weight: 800; margin-top: 2px; }
      .t01-text { flex: 1 1 auto; font-size: 44px; line-height: 60px; font-weight: 700; color: var(--white); }
    `;
    document.head.appendChild(style);

    const label = document.createElement("div");
    label.className = "t05";
    label.textContent = cfg.label;
    Object.assign(label.style, { right: "80px", top: "60px" });
    stage.appendChild(label);

    const list = document.createElement("div");
    list.className = "t01-list";
    stage.appendChild(list);

    const dimOld = cfg.dimOld ?? 0.6;
    const lines = cfg.lines.map((l) => ({ ...l, el: makeLine(list, l) }));

    // 강조할 구절 아래 레드 밑줄. 대화 줄이 어두워져도 밝게 남도록 stage에 따로 올린다.
    // 위치는 애니메이션 초기값을 걸기 전, 최종 배치 기준으로 잰다.
    lines.forEach((l) => {
      if (!l.el.mark) return;
      const s = stage.getBoundingClientRect();
      for (const r of l.el.mark.getClientRects()) {
        const u = document.createElement("div");
        Object.assign(u.style, { position: "absolute", left: r.left - s.left + "px", top: r.bottom - s.top + 2 + "px",
          width: r.width + "px", height: "6px", background: "var(--red)", transformOrigin: "left center" });
        stage.appendChild(u);
        gsap.set(u, { scaleX: 0 });
        tl.to(u, { scaleX: 1, duration: 0.4, ease: "power3.out" }, l.mark.at);
      }
    });

    lines.forEach((l, idx) => {
      const { row, tag, txt } = l.el;
      if (l.state === "shown") {
        gsap.set(row, { opacity: l.opacity ?? 1 });
        return;
      }
      gsap.set(row, { opacity: 1 });
      gsap.set(tag, { opacity: 0, x: -16 });
      gsap.set(txt, { opacity: 0, y: 12, clipPath: "inset(0% 100% 0% 0%)" });
      tl.to(tag, { opacity: 1, x: 0, duration: 0.3, ease: "power3.out" }, l.at);
      tl.to(txt, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, l.at + 0.08);
      tl.to(txt, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "power2.out" }, l.at + 0.08);
      // 윗줄들 옅게
      lines.slice(0, idx).forEach((p) => {
        tl.to(p.el.row, { opacity: dimOld, duration: 0.35, ease: "power2.out" }, l.at);
      });
    });

    const wave = makeWave(stage, cfg);
    return { lines, wave, list, label };
  };
})();
