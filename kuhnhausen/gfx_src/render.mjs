// 사용법: node render.mjs B04 [--check]
//   프레임을 PNG로 캡처 → ffmpeg로 묶음. 앞뒤 핸들 0.5초(15프레임)는 첫/끝 프레임 정지.
//   --check 는 검수용 프레임(0.6초, 가운데, 끝-0.6초)만 뽑는다.
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 컨테이너에 미리 깔린 전역 playwright를 쓴다
const { chromium } = createRequire(import.meta.url)("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const id = process.argv[2];
const checkOnly = process.argv.includes("--check");
const FPS = 30, HANDLE = 15;
const outDir = path.resolve(here, "../40_gfx");
const qcDir = path.resolve(here, "../40_gfx/_qc");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(qcDir, { recursive: true });

const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(`file://${here}/stage.html?clip=${id}`);
await page.waitForFunction(() => window.__ready === true);
const clip = await page.evaluate(() => window.__clip);
const transparent = clip.format === "overlay";
const bodyFrames = Math.round(clip.duration * FPS);

async function grab(t, file) {
  await page.evaluate((tt) => window.__seek(tt), t);
  await page.screenshot({ path: file, omitBackground: transparent, type: "png" });
}

// 검수 프레임 (본 길이 기준 시각)
const extra = (process.argv.find((a) => a.startsWith("--at=")) || "").slice(5).split(",").filter(Boolean).map(Number);
for (const [name, t] of [["a_0.6s", 0.6], ["b_mid", clip.duration / 2], ["c_end-0.6s", clip.duration - 0.6],
  ...extra.map((x) => [`x_${x}s`, x])]) {
  await grab(t, path.join(qcDir, `${clip.file}_${name}.png`));
}
if (checkOnly) { await browser.close(); console.log("check frames ->", qcDir); process.exit(0); }

const tmp = fs.mkdtempSync(path.join(here, ".frames-"));
let n = 0;
const put = (src) => fs.copyFileSync(src, path.join(tmp, `f${String(n++).padStart(5, "0")}.png`));
for (let f = 0; f < bodyFrames; f++) {
  const file = path.join(tmp, `body${f}.png`);
  // 마지막 프레임은 본 길이 끝(t = duration) 상태
  await grab(f === bodyFrames - 1 ? clip.duration : f / FPS, file);
  if (f === 0) for (let h = 0; h < HANDLE; h++) put(file);
  put(file);
  if (f === bodyFrames - 1) for (let h = 0; h < HANDLE; h++) put(file);
  fs.unlinkSync(file);
}
await browser.close();

const ext = transparent ? "mov" : "mp4";
const out = path.join(outDir, `${clip.file}.${ext}`);
if (fs.existsSync(out)) { console.error("이미 있는 파일이라 덮어쓰지 않음:", out); process.exit(1); }
const codec = transparent
  ? ["-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-alpha_bits", "16", "-vendor", "apl0"]
  : ["-c:v", "libx264", "-crf", "14", "-preset", "slow", "-pix_fmt", "yuv420p",
     "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart"];
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(tmp, "f%05d.png"),
  "-vf", transparent ? "null" : "scale=out_color_matrix=bt709", ...codec, out], { stdio: "inherit" });
fs.rmSync(tmp, { recursive: true, force: true });
console.log("done:", out, `${n} frames`);
