"""Soundtrack for KEEP GOING (30s, 120 BPM, C major, I-V-vi-IV), locked to the edit.

usage: python music.py build/music.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
N = int(SR * 30.0)
rng = np.random.default_rng(11)


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


def note(n):  # midi -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def saw(f, n, det=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * f * (1 + det)) % 1.0) - 1


def sine(f, n):
    return np.sin(2 * np.pi * f * np.arange(n) / SR)


# ---------- instruments ----------
def kick():
    n = T(0.4)
    t = np.arange(n) / SR
    f = 48 + 120 * np.exp(-t / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.12)
    return np.tanh(1.7 * (s + hp(rng.standard_normal(n), 3000) * env(n, 0.003) * 0.3))


def clap():
    n = T(0.3)
    nz = bp(rng.standard_normal(n), 1000, 5000)
    e = np.zeros(n)
    for k, d in enumerate([0, 0.01, 0.02]):
        i = T(d)
        e[i:] += env(n - i, 0.006 if k < 2 else 0.08)
    return nz * e * 0.8


def hat(open_=False):
    n = T(0.22 if open_ else 0.045)
    return hp(rng.standard_normal(n), 8000) * env(n, 0.06 if open_ else 0.011) * 0.3


def marimba(f, length=0.5, g=0.5):
    n = T(length)
    s = sine(f, n) * env(n, 0.18) + 0.35 * sine(f * 4, n) * env(n, 0.03) + 0.15 * sine(f * 10, n) * env(n, 0.008)
    return s * g


def bell(f, length=1.6, g=0.3):
    n = T(length)
    s = sine(f, n) * env(n, 0.6) + 0.5 * sine(f * 2.76, n) * env(n, 0.25) + 0.25 * sine(f * 5.4, n) * env(n, 0.1)
    return s * g


def pluck(f, length=0.25, g=0.22):
    n = T(length)
    return lp(saw(f, n) + saw(f, n, 0.007), 3200) * env(n, 0.07) * g


def thud():
    n = T(0.35)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(90 * np.exp(-t / 0.08) + 50) / SR) * env(n, 0.09)
    return s + lp(rng.standard_normal(n), 600) * env(n, 0.03) * 0.5


def boom(big=False):
    n = T(2.2 if big else 1.2)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(32 + 60 * np.exp(-t / 0.1)) / SR) * env(n, 0.6 if big else 0.35)
    crash = lp(hp(rng.standard_normal(n), 500), 10000) * env(n, 0.45 if big else 0.2) * 0.3
    return np.tanh(1.3 * (1.1 * s + crash))


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


def bloop(f0, f1, length=0.25, g=0.3):
    n = T(length)
    f = np.geomspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, n)) * g


def riser(a, b):
    n = T(b - a)
    p = np.arange(n) / n
    f = 130 * 2 ** (p * 3)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return (tone * 0.25 + hp(rng.standard_normal(n), 1500) * 0.5 * p ** 2) * p ** 1.6


# ---------- arrangement ----------
drums, bass, pads, keys, fx = (np.zeros(N) for _ in range(5))
PROG = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [57, 60, 64]), (41, [57, 60, 65])]  # C G Am F

# A: stair hops play an ascending marimba line; the failed hop thuds
for t_, n_ in [(0.45, 60), (0.9, 62), (1.25, 64), (1.6, 65), (2.15, 64), (2.8, 67), (3.1, 69), (3.4, 71)]:
    add(keys, marimba(note(n_)), t_, 0.55)
add(fx, thud(), 1.85, 0.8)
add(fx, bloop(300, 1200, 0.5, 0.25), 3.45)                       # launch
add(fx, whoosh(0.5), 3.55, 0.5)                                  # rainbow wipe

kick_t = [b * 0.5 for b in range(9, 36)] + [b * 0.5 for b in range(40, 48)] + [26.0, 27.0, 28.0]
kick_t = [k for k in kick_t if k >= 4.5]
for k in kick_t:
    add(drums, kick(), k, 0.9)
for b in range(10, 36):
    if b % 2 == 1:
        add(drums, clap(), b * 0.5, 0.5)
for b in range(41, 48, 2):
    add(drums, clap(), b * 0.5, 0.55)
for b in range(9, 36):
    add(drums, hat(b % 4 == 3), b * 0.5 + 0.25, 0.55)
for s in range(160, 192):
    add(drums, hat(), s * 0.125, 0.4 if s % 2 else 0.2)
r = 18.0                                                          # snare roll into the drop
while r < 20.0:
    p = (r - 18) / 2
    add(drums, clap(), r, 0.12 + 0.45 * p)
    r += 0.25 if p < 0.5 else 0.125 if p < 0.8 else 0.0625

duck = np.ones(N)
for k in kick_t:
    i, n = T(k), T(0.3)
    j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], 1 - 0.7 * np.exp(-np.arange(j - i) / (0.07 * SR)))

for bar in range(15):
    t0 = bar * 2.0
    root, chord = PROG[bar % 4]
    if 4.0 <= t0 < 18.0 or 20.0 <= t0 < 24.0:                     # bass: 8ths
        for e in range(8):
            n = T(0.22)
            f = note(root - 12 + (12 if e % 2 else 0))
            add(bass, lp(saw(f, n) + 0.7 * sine(f, n), 1000) * env(n, 0.12), t0 + e * 0.25, 0.45)
    n = T(2.2)                                                      # pads everywhere
    s = sum(saw(note(m), n, d) for m in chord for d in (-0.004, 0, 0.005))
    a = np.minimum(1, np.arange(n) / (0.2 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    add(pads, lp(s, 1800 if t0 >= 20 else 1100) * a, t0, 0.03 if t0 < 4 else 0.045)
    if 8.0 <= t0 < 18.0 or 20.0 <= t0 < 24.0:                     # pluck arps
        for k in range(16):
            m = chord[k % 3] + (12 if (k // 3) % 2 else 0)
            add(keys, pluck(note(m)), t0 + k * 0.125, 0.75 if t0 >= 20 else 0.5)

# morph pings + colour shockwaves (B), merge bloops (C)
for i, t_ in enumerate([5.5, 6.0, 6.5, 7.0]):
    add(fx, bell(note(72 + [0, 4, 7, 12][i]), 1.0, 0.25), t_)
add(fx, boom(), 4.5, 0.7)
add(fx, whoosh(0.4), 7.4, 0.4)
for i, t_ in enumerate(np.arange(8.1, 11.5, 0.42)):
    add(fx, bloop(200 + 40 * i, 500 + 60 * i, 0.22, 0.18), t_)
add(fx, boom(True), 12.0, 0.8)                                    # BREAK
add(fx, whoosh(0.6, False), 15.3, 0.4)
add(fx, bloop(1200, 200, 0.4, 0.25), 15.5)                         # collapse
add(fx, boom(), 16.0, 0.5)                                        # REBUILD
for t_ in [16.5, 17.0, 17.5, 18.0, 18.5, 19.0, 19.25, 19.5, 19.625, 19.75, 19.875]:
    add(fx, marimba(note(84), 0.15, 0.12), t_)                     # tile rotations
add(fx, riser(18.2, 20.0), 18.2, 0.8)
add(fx, boom(True), 20.0, 0.9)                                    # KEEP GOING
add(fx, whoosh(0.8), 22.4, 0.5)                                   # ribbons
add(fx, whoosh(0.8), 23.4, 0.4)
# SWEET: assembly clicks rising, completion chime, outro bells
scale = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84]
for i in range(22):
    add(fx, marimba(note(scale[i % len(scale)] + 12 * (i // len(scale))), 0.2, 0.12), 24.65 + i * 0.05)
add(fx, boom(), 25.75, 0.6)
for k, m in enumerate([72, 76, 79, 84, 88]):
    add(fx, bell(note(m), 2.5, 0.22), 25.75 + k * 0.06)
for k in range(14):
    add(fx, bell(note([84, 88, 91, 96][k % 4]), 0.8, 0.07), 25.85 + k * 0.12)
for k, m in enumerate([60, 64, 67, 72, 76, 79]):                 # end chord swell
    add(pads, lp(sum(saw(note(m), T(4.2), d) for d in (-0.004, 0.005)), 2200) * np.minimum(1, np.arange(T(4.2)) / (0.4 * SR)), 25.75, 0.02)
for t_, m in [(26.5, 79), (27.0, 76), (27.5, 72), (28.0, 74), (28.5, 79), (29.0, 84)]:
    add(keys, bell(note(m), 1.5, 0.18), t_)

# ---------- mix ----------
ir_n = T(1.5)
ir = lp(rng.standard_normal(ir_n) * env(ir_n, 0.32), 7000)
ir /= np.sqrt(np.sum(ir ** 2))
wet = fftconvolve(pads * duck + keys + 0.5 * fx + 0.25 * drums, ir)[:N] * 0.32
mix = drums + bass * duck + pads * duck + keys * (0.6 + 0.4 * duck) + fx + wet
mix = hp(mix, 25)
mix = np.tanh(mix * 1.35) / np.tanh(1.35)
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
