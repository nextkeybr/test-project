"""Paper-cut day/night loop renderer (Vox-style paper motion).

Layers are Nano Banana 2 images on a flat magenta background. This script keys
them out, stacks them with paper drop shadows, and animates a seamless
day -> night -> day loop.

usage: python render.py RAW_DIR OUT.mp4 [--seconds 12] [--fps 24] [--preview]
"""
import argparse
import math
import os
import shutil
import subprocess

import numpy as np
from PIL import Image, ImageChops, ImageFilter

W, H = 1080, 1920
TAU = 2 * math.pi


# ---------- layer prep ----------

def key_magenta(img, crop=True):
    """Magenta chroma key -> RGBA. 'Magenta-ness' = min(R,B) - G."""
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = np.minimum(r, b) - g
    alpha = 1.0 - np.clip((mag - 45.0) / 55.0, 0, 1)
    # despill: pull leftover magenta out of edge pixels
    spill = np.clip(mag, 0, None) * (1 - alpha * 0.5)
    r2, b2 = r - spill, b - spill
    out = np.dstack([r2, g, b2, alpha * 255]).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(out, "RGBA")
    # 1px choke + soften so paper edges look cut, not fringed
    al = im.getchannel("A").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    im.putalpha(al)
    return im.crop(im.getbbox()) if crop else im


def fit(im, width=None, height=None):
    if width:
        height = round(im.height * width / im.width)
    else:
        width = round(im.width * height / im.height)
    return im.resize((width, height), Image.LANCZOS)


def with_shadow(im, off=(7, 9), blur=9, opacity=0.35):
    """Add a soft paper drop shadow under a layer (returns padded RGBA + pad)."""
    pad = blur * 3 + max(off)
    w, h = im.width + pad * 2, im.height + pad * 2
    sh_a = Image.new("L", (w, h), 0)
    sh_a.paste(im.getchannel("A"), (pad + off[0], pad + off[1]))
    sh_a = sh_a.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * opacity))
    out = Image.new("RGBA", (w, h), (20, 18, 30, 0))
    out.putalpha(sh_a)
    out.alpha_composite(im, (pad, pad))
    return out, pad


def grade(im, mul, add=(0, 0, 0)):
    """Color-grade RGB (keeps alpha)."""
    a = np.asarray(im).astype(np.float32)
    a[..., :3] = a[..., :3] * np.array(mul, np.float32) + np.array(add, np.float32)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGBA")


NIGHT = (0.42, 0.50, 0.78)  # moonlit blue multiply


def day_night_pair(im, night_mul=NIGHT):
    return im, grade(im, night_mul)


def split_components(im, n=4, min_px=4000):
    """Split a sheet with several separate clouds into individual RGBA pieces."""
    from scipy import ndimage
    a = np.asarray(im.getchannel("A")) > 40
    lab, cnt = ndimage.label(ndimage.binary_dilation(a, iterations=6))
    sizes = ndimage.sum(a, lab, range(1, cnt + 1))
    order = np.argsort(sizes)[::-1][:n]
    pieces = []
    for i in order:
        if sizes[i] < min_px:
            continue
        sl = ndimage.find_objects((lab == i + 1).astype(int))[0]
        box = (sl[1].start, sl[0].start, sl[1].stop, sl[0].stop)
        m = Image.fromarray(((lab == i + 1) * 255).astype(np.uint8)).crop(box)
        p = im.crop(box)
        p.putalpha(ImageChops.multiply(p.getchannel("A"), m))
        pieces.append(p)
    return pieces


def paper_from_texture(tex, color):
    """Re-tint a paper texture sheet to a new base color (keeps fiber detail)."""
    g = np.asarray(tex.convert("L")).astype(np.float32)
    detail = (g - g.mean()) / (g.std() + 1e-6)
    base = np.array(color, np.float32)
    out = base[None, None, :] + detail[..., None] * 6.0
    return Image.fromarray(out.clip(0, 255).astype(np.uint8), "RGB")


# ---------- animation helpers ----------

def smooth(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def night_amount(t):
    """0 = day, 1 = night. Holds on day and night, transitions between."""
    c = 0.5 - 0.5 * math.cos(TAU * t)  # 0 at t=0, 1 at t=.5
    return smooth((c - 0.15) / 0.7)


def boil(seed, t, amp):
    """Loop-safe 'paper boil' jitter using integer harmonics of the loop."""
    return amp * (math.sin(TAU * (7 * t) + seed) * 0.6 + math.sin(TAU * (11 * t) + seed * 2.3) * 0.4)


def comp(canvas, im, x, y):
    """alpha_composite with clipping (supports negative / off-canvas positions)."""
    x, y = int(round(x)), int(round(y))
    sx, sy = max(0, -x), max(0, -y)
    dx, dy = max(0, x), max(0, y)
    w = min(im.width - sx, canvas.width - dx)
    h = min(im.height - sy, canvas.height - dy)
    if w <= 0 or h <= 0:
        return
    canvas.alpha_composite(im, (dx, dy), (sx, sy, sx + w, sy + h))


def blend_pair(pair, n):
    d, nt = pair
    if n <= 0.001:
        return d
    if n >= 0.999:
        return nt
    return Image.blend(d, nt, n)


# ---------- build scene ----------

def load(raw, name):
    return Image.open(os.path.join(raw, name + ".png"))


def build(raw):
    S = {}
    night_tex = load(raw, "bg_night").convert("RGB").resize((W, H), Image.LANCZOS)
    day_path = os.path.join(raw, "bg_day.png")
    day_bg = (Image.open(day_path).convert("RGB").resize((W, H), Image.LANCZOS)
              if os.path.exists(day_path) else paper_from_texture(night_tex, (238, 232, 219)))
    S["sky"] = (day_bg.convert("RGBA"), night_tex.convert("RGBA"))

    sun = fit(key_magenta(load(raw, "sun")), width=410)
    S["sun"] = with_shadow(sun, off=(5, 7), blur=8, opacity=0.25)
    moon = fit(key_magenta(load(raw, "moon")), width=300)
    S["moon"] = with_shadow(moon, off=(5, 7), blur=10, opacity=0.35)
    # soft moon halo
    hy, hx = np.mgrid[0:700, 0:700]
    r = np.hypot(hx - 350, hy - 350) / 350
    S["halo"] = Image.fromarray((np.clip(1 - r, 0, 1) ** 2 * 110).astype(np.uint8))

    clouds = split_components(key_magenta(load(raw, "clouds")))
    S["clouds"] = []
    for i, c in enumerate(clouds):
        c = fit(c, width=[440, 360, 300, 260][i % 4])
        S["clouds"].append(day_night_pair(with_shadow(c, off=(4, 6), blur=6, opacity=0.25)[0],
                                          (0.36, 0.44, 0.70)))

    mtn = fit(key_magenta(load(raw, "mountains_far")), width=1240)
    S["mtn"] = day_night_pair(with_shadow(mtn, blur=10, opacity=0.3)[0], (0.34, 0.42, 0.66))
    hills = fit(key_magenta(load(raw, "hills_near")), width=1240)
    S["hills"] = day_night_pair(with_shadow(hills, blur=10, opacity=0.35)[0], (0.30, 0.38, 0.60))

    # palace keeps its full-frame registration (uncropped) so day/night line up
    def palace(name):
        im = load(raw, name).convert("RGB").resize((W, H), Image.LANCZOS)
        return key_magenta(im, crop=False)
    pd = palace("palace_day")
    pn = (palace("palace_night") if os.path.exists(os.path.join(raw, "palace_night.png"))
          else grade(pd, NIGHT))
    day, pad = with_shadow(pd, blur=12, opacity=0.35)
    S["palace"] = (day, with_shadow(pn, blur=12, opacity=0.35)[0])
    S["palace_pad"] = pad

    pine = fit(key_magenta(load(raw, "pine")), height=700)
    S["pine"] = day_night_pair(with_shadow(pine, off=(10, 12), blur=12, opacity=0.4)[0], (0.30, 0.38, 0.58))

    rng = np.random.default_rng(7)
    S["stars"] = []
    for grp in range(3):
        st = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        a = np.zeros((H, W), np.float32)
        for _ in range(45):
            x, y = rng.integers(20, W - 20), rng.integers(20, 900)
            rad = rng.uniform(1.2, 3.2)
            yy, xx = np.ogrid[-6:7, -6:7]
            blob = np.clip(1 - np.hypot(xx, yy) / rad, 0, 1)
            a[y - 6:y + 7, x - 6:x + 7] = np.maximum(a[y - 6:y + 7, x - 6:x + 7], blob)
        st = Image.new("RGBA", (W, H), (255, 246, 214, 0))
        st.putalpha(Image.fromarray((a * 255).astype(np.uint8)))
        S["stars"].append(st)

    # warm dusk wash (radial, low on the horizon)
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.hypot((xx - W * 0.5) / W, (yy - 820) / H * 1.6)
    S["dusk"] = Image.fromarray((np.clip(1 - d * 1.6, 0, 1) * 255).astype(np.uint8))
    return S


# ---------- render one frame ----------

CLOUD_ROWS = [(250, 1, 0.10), (420, -1, 0.55), (150, 1, 0.80), (560, -1, 0.35)]


def frame(S, t):
    n = night_amount(t)
    dusk = (4 * n * (1 - n)) ** 1.5  # peaks mid-transition
    cv = blend_pair(S["sky"], n).copy()

    # dusk glow on sky
    glow = Image.new("RGBA", (W, H), (244, 150, 92, 0))
    glow.putalpha(S["dusk"].point(lambda v: int(v * 0.55 * dusk)))
    cv.alpha_composite(glow)

    # stars
    for i, st in enumerate(S["stars"]):
        tw = 0.65 + 0.35 * math.sin(TAU * (3 + i) * t + i * 2.1)
        amt = max(0.0, (n - 0.35) / 0.65) * tw
        if amt > 0.01:
            s2 = st.copy()
            s2.putalpha(st.getchannel("A").point(lambda v: int(v * amt)))
            cv.alpha_composite(s2)

    # sun sets / moon rises (sink behind the mountains)
    sun, spad = S["sun"]
    sx, sy = 340 - sun.width / 2 + 40 * n, 330 - sun.height / 2 + 900 * smooth(n * 1.15)
    comp(cv, sun, sx + boil(1, t, 1.5), sy)
    moon, mpad = S["moon"]
    mx, my = 740 - moon.width / 2 - 30 * (1 - n), 360 - moon.height / 2 + 900 * smooth((1 - n) * 1.15)
    if n > 0.02:
        hl = Image.new("RGBA", S["halo"].size, (255, 240, 200, 0))
        hl.putalpha(S["halo"].point(lambda v: int(v * n)))
        comp(cv, hl, mx + moon.width / 2 - 350, my + moon.height / 2 - 350)
    comp(cv, moon, mx + boil(2, t, 1.5), my)

    # clouds drift and wrap (each crosses the frame an integer number of times)
    for i, pair in enumerate(S["clouds"]):
        y, d, ph = CLOUD_ROWS[i % len(CLOUD_ROWS)]
        c = blend_pair(pair, n)
        span = W + c.width
        x = ((ph + d * t) % 1.0) * span - c.width
        comp(cv, c, x, y + boil(i + 3, t, 3) - c.height / 2)

    # mountains + hills: gentle parallax sway
    m = blend_pair(S["mtn"], n)
    comp(cv, m, (W - m.width) / 2 + 14 * math.sin(TAU * t) + boil(4, t, 1), 330)
    h = blend_pair(S["hills"], n)
    comp(cv, h, (W - h.width) / 2 - 22 * math.sin(TAU * t) + boil(5, t, 1.5), 560)

    # palace: nearly still, just a paper breath
    p = blend_pair(S["palace"], n)
    comp(cv, p, -S["palace_pad"] + boil(6, t, 1.0), -S["palace_pad"] + boil(7, t, 1.0))

    # foreground pine: sways from its base
    pine = blend_pair(S["pine"], n)
    ang = 1.2 * math.sin(TAU * 2 * t) + boil(8, t, 0.3)
    pr = pine.rotate(ang, resample=Image.BICUBIC, center=(pine.width / 2, pine.height), expand=False)
    comp(cv, pr, W - pine.width + 90, H - pine.height + 60)

    # overall night dimming + vignette
    if n > 0.01:
        shade = Image.new("RGBA", (W, H), (8, 12, 40, int(70 * n)))
        cv.alpha_composite(shade)
    return cv.convert("RGB")


def ffmpeg_exe():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    import imageio_ffmpeg  # pip install imageio-ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("raw")
    ap.add_argument("out")
    ap.add_argument("--seconds", type=float, default=12)
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--hold", type=int, default=2, help="render on twos for a stop-motion feel")
    ap.add_argument("--preview", action="store_true", help="save 6 still frames instead of video")
    a = ap.parse_args()

    S = build(a.raw)
    total = int(a.seconds * a.fps)
    if a.preview:
        ims = [frame(S, t).resize((360, 640)) for t in (0, 0.2, 0.35, 0.5, 0.65, 0.85)]
        sheet = Image.new("RGB", (360 * 6, 640))
        for i, im in enumerate(ims):
            sheet.paste(im, (360 * i, 0))
        sheet.save(a.out, quality=88)
        return

    ff = subprocess.Popen(
        [ffmpeg_exe(), "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(a.fps), "-i", "-", "-c:v", "libx264", "-preset", "medium",
         "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", a.out],
        stdin=subprocess.PIPE)
    last = None
    for i in range(total):
        if i % a.hold == 0:
            last = frame(S, i / total).tobytes()
        ff.stdin.write(last)
    ff.stdin.close()
    ff.wait()


if __name__ == "__main__":
    main()
