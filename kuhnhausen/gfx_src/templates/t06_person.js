// T06 인물 카드: 위 칸 옐로우 바탕 + 블랙 이름(56px), 아래 칸 블랙 바탕 + 옐로우 정보(36px)
// 왼쪽에서 밀려 들어옴. 기본 위치는 왼쪽 아래(x 80, 카드 아래 끝 y 860)
// buildT06(stage, tl, { name, info, inAt, outAt, x, bottom }) -> element
(function () {
  window.buildT06 = function (stage, tl, cfg) {
    const card = document.createElement("div");
    Object.assign(card.style, { position: "absolute", left: (cfg.x ?? 80) + "px", bottom: 1080 - (cfg.bottom ?? 860) + "px",
      display: "flex", flexDirection: "column", alignItems: "flex-start" });
    const name = document.createElement("div");
    name.textContent = cfg.name;
    Object.assign(name.style, { background: "var(--yellow)", color: "var(--black)", fontSize: "56px", fontWeight: "800",
      lineHeight: "1", padding: "18px 32px 20px", whiteSpace: "nowrap" });
    const info = document.createElement("div");
    info.textContent = cfg.info;
    Object.assign(info.style, { background: "var(--black)", color: "var(--yellow)", fontSize: "36px", fontWeight: "700",
      lineHeight: "1", padding: "16px 32px 18px", whiteSpace: "nowrap" });
    card.append(name, info);
    stage.appendChild(card);

    // 등장: 칸마다 왼쪽에서 밀려 들어오며 마스크로 드러남(아래 칸이 살짝 늦게)
    [name, info].forEach((el, i) => {
      gsap.set(el, { x: -60, clipPath: "inset(0% 100% 0% 0%)" });
      tl.to(el, { x: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "power3.out" }, cfg.inAt + i * 0.1);
    });
    // 퇴장: 같은 방향(왼쪽)으로 빠지며 가려짐
    if (cfg.outAt != null) {
      [info, name].forEach((el, i) => {
        tl.to(el, { x: -60, clipPath: "inset(0% 100% 0% 0%)", duration: 0.28, ease: "power2.in" }, cfg.outAt + i * 0.05);
      });
    }
    return card;
  };
})();
