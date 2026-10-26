// us-atlas(미국 인구조사국 지도 데이터)에서 오리건주와 카운티 경계만 뽑아 data/oregon.js로 저장
const topo = require("us-atlas/counties-10m.json");
const { feature } = require("topojson-client");
const states = feature(topo, topo.objects.states).features;
const counties = feature(topo, topo.objects.counties).features;
const ring = (g) => (g.type === "Polygon" ? g.coordinates : g.coordinates.flat());
const r = (rings) => rings.map((c) => c.map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)]));
const or = states.find((f) => f.id === "41");
const out = {
  state: r(ring(or.geometry)),
  counties: counties.filter((f) => f.id.startsWith("41")).map((f) => ({ id: f.id, name: f.properties.name, rings: r(ring(f.geometry)) })),
};
require("fs").writeFileSync("data/oregon.js", "// 출처: us-atlas 3.0.1 (미국 인구조사국 카토그래픽 경계)\nwindow.OREGON = " + JSON.stringify(out) + ";\n");
console.log(out.state.length, out.counties.length, out.counties.find((c) => c.id === "41051").name);
