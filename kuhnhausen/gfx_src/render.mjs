// 사용법: node render.mjs B04 B07 ... [--check] [--at=4.5,8.7]
//   프레임을 PNG로 캡처 → ffmpeg로 묶음. 앞뒤 핸들 0.5초(15프레임)는 첫/끝 프레임 정지.
//   --check 는 검수용 프레임(0.6초, 가운데, 끝-0.6초)만 뽑는다.
//   오버레이(.mov)는 확인용 미리보기 mp4(회색 바탕)를 _preview 폴더에 함께 만든다.
//   이미 있는 출력 파일은 덮어쓰지 않고 건너뛴다(고치면 클립 파일의 버전을 올린다).
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 컨테이너에 미리 깔린 전역 playwright를 쓴다
const { chromium } = createRequire(import.meta.url)("playwright");
const here = path.dirname(fileURLToPath(import.meta.url));
const ids = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const checkOnly = process.argv.includes("--check");
const extra = (process.argv.find((a) => a.startsWith("--at=")) || "").slice(5).split(",").filter(Boolean).map(Number);
const FPS = 30, HANDLE = 15;
const outDir = path.resolve(here, "../40_gfx");
const qcDir = path.join(outDir, "_qc");
const pvDir = path.join(outDir, "_preview");
for (const d of [outDir, qcDir, pvDir]) fs.mkdirSync(d, { recursive: true });
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("페이지 오류:", e.message));

for (const id of ids) {
  await page.goto(`file://${here}/stage.html?clip=${id}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
  const clip = await page.evaluate(() => window.__clip);
  const transparent = clip.format === "overlay";
  const ext = transparent ? "mov" : "mp4";
  const out = path.join(outDir, `${clip.file}.${ext}`);
  const grab = async (t, file) => {
    await page.evaluate((tt) => window.__seek(tt), t);
    await page.screenshot({ path: file, omitBackground: transparent, type: "png" });
  };

  // 검수 프레임 3장(+추가 시각) → 한 장으로 묶음. 오버레이는 회색 바탕에 얹어서 봄
  const qcTimes = [0.6, clip.duration / 2, clip.duration - 0.6, ...extra];
  const qcFiles = [];
  for (const [i, t] of qcTimes.entries()) {
    const f = path.join(qcDir, `.tmp_${i}.png`);
    await grab(t, f);
    qcFiles.push(f);
  }
  const bg = transparent ? "0x6a6a6a" : "0x000000";
  const inputs = qcFiles.flatMap((f) => ["-i", f]);
  const chain = qcFiles.map((_, i) => `color=c=${bg}:s=1920x1080[b${i}];[b${i}][${i}]overlay=format=auto,scale=960:-1[v${i}]`).join(";");
  ff([...inputs, "-filter_complex", `${chain};${qcFiles.map((_, i) => `[v${i}]`).join("")}hstack=inputs=${qcFiles.length}`,
    "-frames:v", "1", path.join(qcDir, `${clip.file}_qc.png`)]);
  qcFiles.forEach((f) => fs.unlinkSync(f));
  if (checkOnly) { console.log("check:", clip.file); continue; }
  if (fs.existsSync(out)) { console.log("건너뜀(이미 있음):", path.basename(out)); continue; }

  const bodyFrames = Math.round(clip.duration * FPS);
  const holdFrame = clip.holdFrom != null ? Math.round(clip.holdFrom * FPS) : Infinity;
  const tmp = fs.mkdtempSync(path.join(here, ".frames-"));
  let n = 0, last = null;
  const put = (src) => fs.copyFileSync(src, path.join(tmp, `f${String(n++).padStart(5, "0")}.png`));
  for (let f = 0; f < bodyFrames; f++) {
    let file;
    if (f >= holdFrame && last) file = last; // 이후로 그림이 변하지 않는 클립은 마지막 장을 재사용
    else {
      file = path.join(tmp, `body${f}.png`);
      // 마지막 프레임은 본 길이 끝(t = duration) 상태
      await grab(f === bodyFrames - 1 ? clip.duration : f / FPS, file);
    }
    if (f === 0) for (let h = 0; h < HANDLE; h++) put(file);
    put(file);
    if (f === bodyFrames - 1) for (let h = 0; h < HANDLE; h++) put(file);
    last = file;
  }
  const seq = ["-framerate", String(FPS), "-i", path.join(tmp, "f%05d.png")];
  if (transparent) {
    ff([...seq, "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-alpha_bits", "16", "-vendor", "apl0", out]);
    ff(["-f", "lavfi", "-i", `color=c=0x6a6a6a:s=1920x1080:r=${FPS}`, ...seq, "-filter_complex",
      "[0][1]overlay=format=auto:shortest=1,format=yuv420p", "-c:v", "libx264", "-crf", "20", "-movflags", "+faststart",
      path.join(pvDir, `${clip.file}_미리보기.mp4`)]);
  } else {
    ff([...seq, "-vf", "scale=out_color_matrix=bt709", "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-pix_fmt", "yuv420p",
      "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", out]);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log("done:", path.basename(out), `${n} frames`);
}
await browser.close();
