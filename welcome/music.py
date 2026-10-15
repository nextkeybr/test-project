"""Soundtrack for 어서와 (30s, 120 BPM, A minor pentatonic), hits locked to the edit.

Punchy sidechained groove + Karplus-Strong 'gayageum' plucks with 농현-style vibrato,
a 북 hit on the drop, a breath (near silence) while the doors are closed.
usage: python music.py build/music.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, lfilter

SR = 48000
N = int(SR * 30.0)
rng = np.random.default_rng(23)


def T(s):
    return int(s * SR)


def env(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lp(x, f):
    return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)


def hp(x, f):
    return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)


def add(buf, sig, at, g=1.0):
    i = T(at)
    if i >= len(buf) or i < 0:
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[:j - i] * g


def note(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def saw(f, n, det=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * f * (1 + det)) % 1.0) - 1


def sine(f, n):
    return np.sin(2 * np.pi * f * np.arange(n) / SR)


# ---------- instruments ----------
def gayageum(f, length=1.6, g=0.5, bend=True):
    """Karplus-Strong pluck, then a slow vibrato (농현) applied by phase-warping."""
    n = T(length)
    p = int(SR / f)
    buf = rng.uniform(-1, 1, p)
    buf = lp(buf, min(9000, f * 14))
    out = np.zeros(n)
    # vectorised KS: y[i] = 0.5*(y[i-p] + y[i-p-1]) * decay  (filter form)
    a = np.zeros(p + 2)
    a[0] = 1
    a[p] = -0.4985
    a[p + 1] = -0.4985
    x = np.zeros(n)
    x[:p] = buf
    out = lfilter([1.0], a, x)
    if bend:
        t = np.arange(n) / SR
        vib = np.where(t > 0.25, 0.006 * np.sin(2 * np.pi * 5.2 * (t - 0.25)) * np.minimum(1, (t - 0.25) * 2), 0)
        idx = np.cumsum(1 + vib)
        idx = np.clip(idx, 0, n - 1)
        out = np.interp(idx, np.arange(n), out)
    out *= np.minimum(1, (n - np.arange(n)) / (0.05 * SR))
    return out / (np.max(np.abs(out)) + 1e-9) * g


def kick(big=False):
    n = T(0.45 if big else 0.38)
    t = np.arange(n) / SR
    f = 46 + 130 * np.exp(-t / 0.028)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.15 if big else 0.11)
    return np.tanh(1.9 * (s + hp(rng.standard_normal(n), 3500) * env(n, 0.003) * 0.35))


def clap():
    n = T(0.3)
    nz = bp(rng.standard_normal(n), 1000, 5200)
    e = np.zeros(n)
    for k, d in enumerate([0, 0.009, 0.019]):
        i = T(d)
        e[i:] += env(n - i, 0.006 if k < 2 else 0.085)
    return nz * e * 0.8


def hat(open_=False):
    n = T(0.22 if open_ else 0.045)
    return hp(rng.standard_normal(n), 8000) * env(n, 0.06 if open_ else 0.011) * 0.3


def buk():
    n = T(1.4)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(52 + 45 * np.exp(-t / 0.06)) / SR) * env(n, 0.45)
    skin = lp(rng.standard_normal(n), 900) * env(n, 0.05) * 0.6
    slap = hp(rng.standard_normal(n), 2500) * env(n, 0.004) * 0.4
    return np.tanh(1.6 * (body + skin + slap))


def pop(f=900, g=0.25):
    n = T(0.12)
    fr = f * np.exp(-np.arange(n) / (0.03 * SR)) + f * 0.4
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.03) * g


def tick(f=2600, g=0.12):
    n = T(0.03)
    return sine(f, n) * env(n, 0.006) * g


def whoosh(length=0.55, up=True):
    n = T(length)
    nz = rng.standard_normal(n)
    o = np.zeros(n)
    ch = 24
    for c in range(ch):
        a, b = c * n // ch, (c + 1) * n // ch
        p = c / (ch - 1)
        fc = 300 * (20 ** (p if up else 1 - p))
        o[a:b] = bp(nz[max(0, a - 2000):b], fc * 0.6, min(fc * 1.6, 20000))[-(b - a):]
    return o * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.8


def wood_thunk():
    n = T(0.5)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t / 0.05) + 70) / SR) * env(n, 0.12)
    return s + bp(rng.standard_normal(n), 300, 1800) * env(n, 0.02) * 0.6


def riser(a, b):
    n = T(b - a)
    p = np.arange(n) / n
    tone = np.sin(2 * np.pi * np.cumsum(140 * 2 ** (p * 3)) / SR)
    return (tone * 0.22 + hp(rng.standard_normal(n), 1500) * 0.5 * p ** 2) * p ** 1.6


def rev_cymbal(length=1.0):
    n = T(length)
    s = hp(rng.standard_normal(n), 5000) * env(n, 0.35)
    return s[::-1] * 0.5


# ---------- arrangement ----------
drums, bass, pads, keys, fx = (np.zeros(N) for _ in range(5))
PROG = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]  # Am F C G
PENTA = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81]                                  # A C D E G ...

# intro: night ambience + slow gayageum phrase
amb = lp(rng.standard_normal(T(4.2)), 500) * 0.05
add(fx, amb * np.minimum(1, np.arange(len(amb)) / (0.8 * SR)), 0)
for t_, m in [(0.2, 69), (0.95, 72), (1.45, 76), (1.6, 74), (2.4, 72), (2.9, 69), (3.3, 67)]:
    add(keys, gayageum(note(m), 1.8, 0.4), t_)
add(fx, whoosh(0.6), 3.4, 0.45)

beat = lambda a, b: [x * 0.5 for x in range(int(a * 2), int(b * 2))]
kicks = beat(4, 20) + beat(22, 29)
for k in kicks:
    add(drums, kick(big=(k == 22.0)), k, 0.95)
for b in beat(4, 20) + beat(22, 29):
    if int(b * 2) % 2 == 1:
        add(drums, clap(), b, 0.55)
for b in beat(4, 12):
    add(drums, hat(int(b * 2) % 4 == 3), b + 0.25, 0.55)
for s in range(int(12 * 8), int(18 * 8)):
    add(drums, hat(), s * 0.125, 0.4 if s % 2 else 0.18)
for s in range(int(22 * 8), int(29 * 8)):
    add(drums, hat(), s * 0.125, 0.42 if s % 2 else 0.2)
r = 18.0                                                     # roll into the breath
while r < 20.0:
    p = (r - 18) / 2
    add(drums, clap(), r, 0.12 + 0.4 * p)
    r += 0.25 if p < 0.5 else 0.125 if p < 0.8 else 0.0625

duck = np.ones(N)
for k in kicks:
    i, n = T(k), T(0.32)
    j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], 1 - 0.8 * np.exp(-np.arange(j - i) / (0.08 * SR)))

for bar in range(15):
    t0 = bar * 2.0
    root, chord = PROG[bar % 4]
    if 4.0 <= t0 < 20.0 or 22.0 <= t0 < 29.0:
        for e in range(8):                                   # bass offbeat-heavy pattern
            n = T(0.2)
            f = note(root - 12 + (12 if e in (3, 7) else 0))
            add(bass, lp(saw(f, n) + 0.8 * sine(f, n), 900) * env(n, 0.13), t0 + e * 0.25, 0.5)
    n = T(2.2)
    s = sum(saw(note(m), n, d) for m in chord for d in (-0.004, 0, 0.005))
    a = np.minimum(1, np.arange(n) / (0.25 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    g = 0.03 if t0 < 4 else 0.012 if 20.0 <= t0 < 22.0 else 0.045
    add(pads, lp(s, 1500 if t0 >= 22 else 1000) * a, t0, g)

# greeting cuts: pop + gayageum note on every cut
cuts = [4 + i for i in range(8)] + [12 + 0.5 * i for i in range(12)]
for i, t_ in enumerate(cuts):
    add(fx, pop(700 + (i % 5) * 120), t_, 1.0)
    add(keys, gayageum(note(PENTA[(i * 3) % 7 + 2]), 0.9, 0.3), t_)
for i in range(16):                                          # wall: rapid ticks
    add(fx, tick(2000 + i * 90, 0.14), 18.0 + i * 0.125)
add(fx, riser(18.3, 20.0), 18.3, 0.7)
add(fx, whoosh(0.7, False), 20.0, 0.5)                       # greetings sucked in
add(fx, wood_thunk(), 20.75, 0.9)                            # doors shut
add(fx, sine(55, T(1.2)) * np.linspace(0, 1, T(1.2)) ** 2 * 0.25, 20.8)   # sub swell (breath)
add(fx, rev_cymbal(1.1), 20.9, 0.8)
add(fx, buk(), 22.0, 1.0)                                    # DROP
add(fx, whoosh(0.5), 21.85, 0.5)
# drop melody on gayageum
mel = [(22.5, 76), (22.75, 74), (23.0, 72), (23.5, 69), (24.0, 72), (24.5, 74), (25.0, 76), (25.5, 79),
       (26.0, 81), (26.5, 79), (27.0, 76), (27.5, 74), (28.0, 72), (28.5, 69)]
for t_, m in mel:
    add(keys, gayageum(note(m), 1.2, 0.38), t_)
add(keys, gayageum(note(69), 2.5, 0.45), 29.0)
add(keys, gayageum(note(57), 2.5, 0.35), 29.0)

# ---------- mix ----------
ir_n = T(1.6)
ir = lp(rng.standard_normal(ir_n) * env(ir_n, 0.35), 7000)
ir /= np.sqrt(np.sum(ir ** 2))
wet = fftconvolve(pads * duck + keys + 0.4 * fx + 0.2 * drums, ir)[:N] * 0.3
mix = drums + bass * duck + pads * duck + keys * (0.55 + 0.45 * duck) + fx + wet
mix = hp(mix, 25)
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 0.89 / np.max(np.abs(mix))
mix[T(29.2):] *= np.linspace(1, 0, N - T(29.2)) ** 2
right = mix.copy()
d = T(0.011)
right[d:] = 0.85 * mix[d:] + 0.15 * mix[:-d]
pcm = (np.clip(np.stack([mix, right], 1), -1, 1) * 32767).astype('<i2')
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('ok')
