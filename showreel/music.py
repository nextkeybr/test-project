"""Synthesises the 30s showreel soundtrack (120 BPM, A minor), hits locked to the edit.

usage: python music.py build/music.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(7)


def T(sec):
    return int(sec * SR)


def env_exp(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def add(buf, sig, at, gain=1.0):
    i = T(at)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[:j - i] * gain


def saw(freq, n, detune=0.0):
    t = np.arange(n) / SR
    return 2 * ((t * freq * (1 + detune)) % 1.0) - 1


# ---------- instruments ----------
def kick(big=False):
    n = T(0.55 if big else 0.4)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env_exp(n, 0.16 if big else 0.11)
    click = hp(rng.standard_normal(n), 3000) * env_exp(n, 0.003) * 0.4
    return np.tanh((s + click) * 1.6)


def clap():
    n = T(0.35)
    nz = bp(rng.standard_normal(n), 900, 4000)
    e = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        i = T(d)
        e[i:] += env_exp(n - i, 0.006 if k < 2 else 0.09)
    return nz * e * 0.8


def hat(open_=False):
    n = T(0.25 if open_ else 0.05)
    return hp(rng.standard_normal(n), 7500) * env_exp(n, 0.07 if open_ else 0.012) * 0.35


def boom(big=False):
    n = T(2.5 if big else 1.4)
    t = np.arange(n) / SR
    f = 32 + 60 * np.exp(-t / 0.12)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.7 if big else 0.4)
    crash = lp(hp(rng.standard_normal(n), 400), 9000) * env_exp(n, 0.5 if big else 0.25) * 0.35
    return np.tanh((s * 1.2 + crash) * 1.3)


def whoosh(length=0.6, up=True):
    n = T(length)
    nz = rng.standard_normal(n)
    out = np.zeros(n)
    # sweep band-pass in short chunks
    chunks = 24
    for c in range(chunks):
        a, b = c * n // chunks, (c + 1) * n // chunks
        p = c / (chunks - 1)
        fc = 300 * (20 ** (p if up else 1 - p))
        out[a:b] = bp(nz[max(0, a - 2000):b], fc * 0.6, min(fc * 1.6, 20000))[-(b - a):]
    shape = np.sin(np.linspace(0, np.pi, n)) ** 2
    return out * shape * 0.9


def blip(freq=1800, length=0.04, g=0.25):
    n = T(length)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * freq * t) * env_exp(n, length / 4) * g


def pluck(freq, length=0.22):
    n = T(length)
    s = saw(freq, n) + saw(freq, n, 0.006)
    return lp(s, 2800) * env_exp(n, 0.07) * 0.22


def riser(a, b):
    n = T(b - a)
    t = np.arange(n) / SR
    p = t / (b - a)
    f = 110 * (2 ** (p * 3))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    nz = hp(rng.standard_normal(n), 1500) * p ** 2
    return (tone * 0.25 + nz * 0.5) * p ** 1.5


# ---------- arrangement ----------
drums = np.zeros(N)
bass = np.zeros(N)
pads = np.zeros(N)
fx = np.zeros(N)
lead = np.zeros(N)

# bars of 2s: Am F C G
PROG = [(55.0, [220.0, 261.63, 329.63]), (43.65, [174.61, 220.0, 261.63]),
        (65.41, [196.0, 261.63, 329.63]), (49.0, [196.0, 246.94, 293.66])]

kick_times = [b * BEAT for b in range(int(2 / BEAT), int(18 / BEAT))] + \
             [b * BEAT for b in range(int(20 / BEAT), int(26 / BEAT))]
for kt in kick_times:
    add(drums, kick(big=kt in (20.0,)), kt, 0.95)
for b in range(int(4 / BEAT), int(18 / BEAT)):
    if b % 2 == 1:
        add(drums, clap(), b * BEAT, 0.55)
for b in range(int(20 / BEAT), int(26 / BEAT)):
    if b % 2 == 1:
        add(drums, clap(), b * BEAT, 0.6)
for b in range(int(2 / BEAT), int(18 / BEAT)):
    add(drums, hat(open_=(b % 4 == 3)), b * BEAT + BEAT / 2, 0.6)
for s16 in range(int(20 / 0.125), int(26 / 0.125)):
    add(drums, hat(), s16 * 0.125, 0.45 if s16 % 2 else 0.25)
# snare roll into the drop
roll_t = 18.0
while roll_t < 20.0:
    p = (roll_t - 18) / 2
    add(drums, clap(), roll_t, 0.15 + 0.45 * p)
    roll_t += 0.25 if p < 0.5 else 0.125 if p < 0.8 else 0.0625

# sidechain envelope (ducks on every kick)
duck = np.ones(N)
for kt in kick_times:
    i = T(kt)
    n = T(0.3)
    j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], 1 - 0.75 * np.exp(-np.arange(j - i) / (0.07 * SR)))

# bass: 8th-note saw, filtered
for bar in range(15):
    t0 = bar * 2.0
    if t0 < 2.0 or 18.0 <= t0 < 20.0 or t0 >= 26.0:
        continue
    root = PROG[bar % 4][0]
    for e8 in range(16):
        st = t0 + e8 * 0.125 * 2 / 2
        n = T(0.12)
        f = root * (2 if e8 % 4 == 2 else 1)
        s = saw(f, n) + 0.6 * np.sin(2 * np.pi * f / 2 * np.arange(n) / SR)
        add(bass, lp(s, 900) * env_exp(n, 0.08), st, 0.45)

# pads (whole reel, quieter in the intro)
for bar in range(15):
    t0 = bar * 2.0
    n = T(2.2)
    s = np.zeros(n)
    for f in PROG[bar % 4][1]:
        for d in (-0.004, 0.0, 0.005):
            s += saw(f, n, d)
    a = np.minimum(1, np.arange(n) / (0.25 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.3 * SR))
    g = 0.035 if t0 < 2 else 0.05 if t0 < 20 else 0.06
    add(pads, lp(s, 1600 if t0 >= 20 else 1000) * a, t0, g)

# arp on the drop
for s16 in range(int(20 / 0.125), int(24 / 0.125)):
    t0 = s16 * 0.125
    bar = int(t0 // 2)
    chord = PROG[bar % 4][1]
    f = chord[s16 % 3] * (2 if (s16 // 3) % 2 else 1)
    add(lead, pluck(f), t0, 0.8)

# impacts / fx locked to picture
for t_, big in [(0.25, False), (2.0, False), (6.0, False), (10.0, False), (14.0, False), (20.0, True), (26.0, True)]:
    add(fx, boom(big), t_, 0.9 if big else 0.6)
add(fx, blip(900, 0.3, 0.3) * np.linspace(1, 0, T(0.3)), 0.25)           # dot pop
for t_ in (2.5, 5.0):                                                     # slams
    add(fx, boom(False), t_, 0.5)
for t_ in (3.5, 5.55, 9.68, 11.55, 13.7, 15.45, 17.45, 23.45, 25.6):        # transitions
    add(fx, whoosh(0.55), t_ - 0.3, 0.5)
add(fx, riser(18.4, 20.0), 18.4, 0.8)
for t_ in np.arange(20.0, 22.0, 0.25):                                    # montage cut ticks
    add(fx, blip(2400, 0.03, 0.18), t_)
for t_ in np.arange(16.1, 17.0, 0.06):                                    # counter ticks
    add(fx, blip(3200, 0.015, 0.06), t_)
for si in range(3):                                                       # slot rolls
    for t_ in np.arange(24.0 + si * 0.22, 24.0 + si * 0.22 + 0.7, 0.045):
        add(fx, blip(2000 + si * 400, 0.015, 0.07), t_)
for k in range(6):                                                        # logo letters
    add(fx, blip(1400 + k * 120, 0.05, 0.1), 26.5 + k * 0.045)
for t_ in (6.5, 7.0, 7.5, 8.0):                                           # shape morphs
    add(fx, blip(700, 0.12, 0.2), t_)

# ---------- mix ----------
ir_n = T(1.6)
ir = rng.standard_normal(ir_n) * env_exp(ir_n, 0.35)
ir = lp(ir, 6000)
ir /= np.sqrt(np.sum(ir ** 2))
wet_src = pads * duck + lead * duck + 0.4 * fx + 0.3 * drums
wet = fftconvolve(wet_src, ir)[:N] * 0.35

mix = drums + bass * duck + pads * duck + lead * duck + fx + wet
mix = hp(mix, 25)
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix *= 0.89 / np.max(np.abs(mix))
fade = np.ones(N)
fade[T(29.0):] = np.linspace(1, 0, N - T(29.0)) ** 2
mix *= fade

# stereo: slight width via delayed copy of wet
left = mix
right = mix.copy()
d = T(0.012)
right[d:] = mix[:-d] * 0.15 + mix[d:] * 0.85
st = np.stack([left, right], axis=1)
pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('ok')
