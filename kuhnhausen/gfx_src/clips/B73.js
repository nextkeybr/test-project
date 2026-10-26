// B73 · L-B73_GFX_map-c_v2_카운티-경계 · T11 · 풀프레임 · 6초
// 오리건 북부 확대, 멀트노마 카운티 경계(미국 인구조사국 경계 데이터)가 1.0초에 레드로 굵어지며 잠김 표시
// 3.5초 오른쪽 아래 RD-003 해당 문장(T09 축소판). 캡처가 없어 문장만, 형광펜 없이
window.CLIP = {
  file: "L-B73_GFX_map-c_v2_카운티-경계",
  format: "full",
  duration: 6,
  build(stage, tl) {
    const m = buildT11(stage, tl, { cam: { s: 4.2, lat: 45.45, lon: -122.55 }, showCounties: true });
    tl.to(m.cam, { s: 4.6, duration: 6, ease: "none" }, 0);
    const mult = m.county("41051");
    tl.to(mult, { a: 1, w: 7, duration: 0.5, ease: "power2.out" }, 1.0);
    const lock = K.div(stage, { width: "64px", height: "92px" });
    K.div(lock, { left: "14px", top: "0px", width: "36px", height: "46px", border: "8px solid var(--white)", borderBottom: "none",
      borderRadius: "22px 22px 0 0" });
    const body = K.div(lock, { left: "0px", top: "38px", width: "64px", height: "54px", background: "var(--red)", border: "3px solid var(--white)" });
    K.div(body, { left: "24px", top: "14px", width: "10px", height: "18px", borderRadius: "5px", background: "var(--white)" });
    m.pinTo(lock, 45.56, -122.4, -32, -60);
    K.pop(tl, lock, 1.3, 0.35, 1.4);
    buildT07(stage, tl, { pos: { left: 80, top: 80 }, bigSize: 56, big: { text: "멀트노마 카운티", at: 1.2, dur: 0.5 },
      subs: [{ text: "가석방되어도 돌아오지 못하게", at: 1.9, dur: 0.6 }] });
    buildT09(stage, tl, {
      mini: true, box: { left: 1040, top: 600, width: 800 }, paperAt: 3.5,
      sentences: [{ en: "preventing Kuhnhausen from returning to Multnomah County upon parole", ko: "가석방 시 멀트노마 카운티로 돌아오지 못하게 막았다", at: 3.6 }],
      source: "공식 자료 · 멀트노마 카운티 2017", sourceAt: 3.7,
    });
    K.hold(tl, 6);
    return () => m.draw();
  },
};
