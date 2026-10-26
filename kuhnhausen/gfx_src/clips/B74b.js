// B74 · L-B74_GFX_card-b_v1_잊을수없다 · T07 · 오버레이 · 4초 (AI 컷 '창가 실루엣' 위)
// 영어 원문을 확인하지 않았으므로 인용 카드(T10)가 아니라 정보 카드(T07)로. 근거: KABC 2014(RV-003 기사)
window.CLIP = {
  file: "L-B74_GFX_card-b_v1_잊을수없다",
  format: "overlay",
  duration: 4,
  build(stage, tl) {
    buildT07(stage, tl, { pos: { left: 80, bottom: 220 }, big: { text: "그가 어떤 사람인지는 잊을 수 없다", at: 0.4, dur: 0.7 },
      subs: [{ text: "2014년 봄 인터뷰 · 보도", at: 1.2, dur: 0.5 }] });
    K.hold(tl, 4);
  },
};
