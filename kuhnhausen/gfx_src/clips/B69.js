// B69 · L-B69_GFX_number_v1_105만-달러 · 풀프레임 · 8초
// 1.0~3.0초 숫자 카운트업(0 → 105만) → 4.0초 아래 문구 → 5.0초 오른쪽에 RD-006 기사 캡처 자리가 작게 슬라이드
// RD-006 캡처가 아직 없어 빈 문서 틀(글자 없음)로 자리만 잡음. 캡처가 오면 v2
window.CLIP = {
  file: "L-B69_GFX_number_v1_105만-달러",
  format: "full",
  duration: 8,
  build(stage, tl) {
    const g = K.div(stage, { left: "960px", top: "440px", display: "flex", flexDirection: "column", alignItems: "center", gap: "26px" });
    gsap.set(g, { xPercent: -50, yPercent: -50 });
    const top = K.div(g, { position: "relative", color: "var(--white)", fontSize: "48px", fontWeight: "800", lineHeight: "1" }, "2008년 민사 배상 판결");
    const num = K.div(g, { position: "relative", color: "var(--yellow)", fontSize: "120px", fontWeight: "800", lineHeight: "1",
      fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }, "약 105만 달러");
    const bot = K.div(g, { position: "relative", color: "var(--white)", opacity: 0.65, fontSize: "36px", fontWeight: "700", lineHeight: "1" },
      "판결 금액 · 실제 지급 여부는 미확인");
    num.style.width = num.getBoundingClientRect().width + "px";
    num.style.textAlign = "center";
    K.inUp(tl, top, 0.3);
    K.inUp(tl, num, 0.8, 0.3);
    gsap.set(bot, { opacity: 0 });
    tl.fromTo(bot, { opacity: 0, y: 12 }, { opacity: 0.65, y: 0, duration: 0.45, ease: "power3.out", immediateRender: false }, 4.0);
    const cnt = { n: 0 };
    tl.to(cnt, { n: 105, duration: 2.0, ease: "power2.out" }, 1.0);
    // 기사 캡처 자리
    const doc = K.div(stage, { left: "1340px", top: "190px", width: "420px", height: "540px", border: "3px solid var(--white)",
      padding: "40px 36px", display: "flex", flexDirection: "column", gap: "18px" });
    [100, 100, 80, 100, 92, 100, 60, 100, 86].forEach((w, i) => K.div(doc, { position: "relative", width: w + "%",
      height: i === 0 ? "30px" : "14px", background: `rgba(242,242,242,${i === 0 ? 0.5 : 0.2})`, marginBottom: i === 0 ? "18px" : "0" }));
    gsap.set(doc, { x: 600, opacity: 0 });
    tl.to(doc, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 5.0);
    tl.to(g, { x: -230, duration: 0.6, ease: "power3.inOut" }, 5.0);
    K.hold(tl, 8);
    return () => { num.textContent = `약 ${Math.round(cnt.n)}만 달러`; };
  },
};
