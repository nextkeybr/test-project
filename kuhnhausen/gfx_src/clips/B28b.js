// B28 · L-B28_GFX_bar_v1_14분-클로즈업 · 풀프레임 · 3초
// '약 14분' 경과 바만 크게(가로 1400px). 초 단위로 흐르는 시계는 쓰지 않는다(정확히 잰 시간이 아님)
window.CLIP = {
  file: "L-B28_GFX_bar_v1_14분-클로즈업",
  format: "full",
  duration: 3,
  build(stage, tl) {
    const track = K.div(stage, { left: "260px", top: "470px", width: "1400px", height: "30px", background: "rgba(242,242,242,0.18)" });
    const fill = K.div(track, { left: "0px", top: "0px", width: "1400px", height: "30px", background: "var(--yellow)", transformOrigin: "left center" });
    gsap.set(fill, { scaleX: 0 });
    tl.to(fill, { scaleX: 1, duration: 2.0, ease: "none" }, 0.3);
    const lab = K.div(stage, { right: "260px", top: "370px", color: "var(--yellow)", fontSize: "80px", fontWeight: "800", lineHeight: "1" }, "약 14분");
    K.inUp(tl, lab, 2.3, 0.35);
    K.hold(tl, 3);
  },
};
