"""Soundtrack for 어서와 — K-pop dance style (30s, 120 BPM, F minor), hits locked to the edit.

Four-on-the-floor kick, layered clap/snare, 808 sub with glide, 3-3-2 supersaw stabs,
a bright lead hook and formant 'vocal chops' on the drop, build -> breath -> silent gap -> drop.
usage: python music.py build/music.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
N = int(SR * 30.0)
rng = np.random.default_rng(31)


def T(s):
    return int(round(s * SR))


def env(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


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


def adsr(n, a=0.005, r=0.05):
    e = np.ones(n)
    na, nr = max(1, T(a)), max(1, T(r))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


def supersaw(f, n, voices=7, spread=0.012):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for v in range(voices):
        d = (v - (voices - 1) / 2) / ((voices - 1) / 2) * spread
        out += 2 * ((t * f * (1 + d) + rng.random()) % 1.0) - 1
    return out / voices


def sine_glide(f0, f1, n, glide=0.06):
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / glide)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# ---------- drums ----------
def kick():
    n = T(0.36)
    t = np.arange(n) / SR
    f = 50 + 140 * np.exp(-t / 0.025)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.12)
    click = hp(rng.standard_normal(n), 4000) * env(n, 0.002) * 0.5
    return np.tanh(2.2 * (s + click))


def snare():
    n = T(0.32)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * np.cumsum(190 + 60 * np.exp(-t / 0.02)) / SR) * env(n, 0.05)
    nz = bp(rng.standard_normal(n), 1500, 9000) * env(n, 0.09)
    clp = np.zeros(n)
    for k, d in enumerate([0, 0.008, 0.016]):
        i = T(d)
        clp[i:] += bp(rng.standard_normal(n - i), 1000, 4500) * env(n - i, 0.005 if k < 2 else 0.07)
    return np.tanh(1.5 * (0.6 * tone + 0.6 * nz + 0.7 * clp))


def hat(open_=False, g=0.3):
    n = T(0.2 if open_ else 0.04)
    return hp(rng.standard_normal(n), 9000) * env(n, 0.05 if open_ else 0.01) * g


def tom(f=120):
    n = T(0.3)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(f + 80 * np.exp(-t / 0.04)) / SR) * env(n, 0.12)


# ---------- synths ----------
def stab(chord, length=0.16, cutoff=5000, g=0.32):
    n = T(length)
    s = sum(supersaw(note(m), n) for m in chord) / len(chord)
    s = s + 0.5 * sum(supersaw(note(m + 12), n, 5, 0.008) for m in chord[:1])
    return lp(s, cutoff) * adsr(n, 0.003, 0.06) * env(n, length * 1.2) * g


def pad(chord, length, cutoff, g=0.1):
    n = T(length)
    s = sum(supersaw(note(m), n, 5, 0.01) for m in chord) / len(chord)
    return lp(s, cutoff) * adsr(n, 0.25, 0.3) * g


def lead(m, length, prev=None, g=0.22):
    n = T(length)
    f1 = note(m)
    f0 = note(prev) if prev is not None else f1
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.035)
    ph = np.cumsum(f) / SR
    sq = np.sign(np.sin(2 * np.pi * ph)) * 0.5 + (2 * ((ph * 1.005) % 1) - 1) * 0.5
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t * 3)
    sq2 = 2 * ((np.cumsum(f * vib * 2) / SR) % 1) - 1          # octave up layer
    s = lp(sq + 0.35 * sq2, 6500)
    return s * adsr(n, 0.004, 0.04) * g


def vchop(m, length=0.18, vowel='a', g=0.3):
    """Formant 'vocal chop' (ah / ey) — a sung-syllable-like synth."""
    n = T(length)
    f = note(m)
    t = np.arange(n) / SR
    src = 2 * ((t * f) % 1.0) - 1 + 0.15 * rng.standard_normal(n)
    F = {'a': [(750, 1.0), (1200, 0.6), (2600, 0.3)], 'e': [(500, 1.0), (1850, 0.7), (2600, 0.3)]}[vowel]
    s = sum(bp(src, fc * 0.88, fc * 1.12) * a for fc, a in F)
    return s * adsr(n, 0.01, 0.06) * g * 3


def sub808(m, length, prev=None, g=0.6):
    n = T(length)
    f1 = note(m)
    s = sine_glide(note(prev) if prev is not None else f1, f1, n, 0.05)
    return np.tanh(1.8 * s) * adsr(n, 0.003, 0.05) * g


def whoosh(length=0.5, up=True):
    n = T(length)
    nz = rng.standard_normal(n)
    o = np.zeros(n)
    ch = 24
    for c in range(ch):
        a, b = c * n // ch, (c + 1) * n // ch
        p = c / (ch - 1)
        fc = 300 * (20 ** (p if up else 1 - p))
        o[a:b] = bp(nz[max(0, a - 2000):b], fc * 0.6, min(fc * 1.6, 20000))[-(b - a):]
    return o * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.7


def impact(g=1.0):
    n = T(1.8)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(34 + 70 * np.exp(-t / 0.08)) / SR) * env(n, 0.5)
    crash = lp(hp(rng.standard_normal(n), 600), 11000) * env(n, 0.4) * 0.35
    return np.tanh(1.4 * (boom + crash)) * g


def riser(length):
    n = T(length)
    p = np.arange(n) / n
    nz = rng.standard_normal(n)
    o = np.zeros(n)
    ch = 32
    for c in range(ch):
        a, b = c * n // ch, (c + 1) * n // ch
        fc = 400 * (24 ** (c / (ch - 1)))
        o[a:b] = bp(nz[max(0, a - 2000):b], fc * 0.7, min(fc * 1.4, 20000))[-(b - a):]
    pitch = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (p * 2)) / SR) * 0.15
    return (o * 0.6 + pitch) * p ** 2


def rev_cymbal(length=0.9):
    n = T(length)
    return (hp(rng.standard_normal(n), 5000) * env(n, 0.3))[::-1] * 0.5


def tick(f=3000, g=0.1):
    n = T(0.025)
    return np.sin(2 * np.pi * f * np.arange(n) / SR) * env(n, 0.005) * g


# ---------- arrangement ----------
drums, bass, synth, leadb, vox, fx = (np.zeros(N) for _ in range(6))
# F minor: Fm Db Ab Eb (bars of 2s)
PROG = [(41, [65, 68, 72]), (37, [61, 65, 68]), (44, [60, 63, 68]), (39, [58, 63, 67])]
STABS = [0, 3, 6, 10, 12]                                       # 3-3-2 feel in 16ths

def chord_at(t):
    return PROG[int(t // 2) % 4]

# intro (0-4): filtered pad swelling, vocal "ooh" chops, riser into 4
for bar in range(2):
    add(synth, pad(PROG[bar][1], 2.1, 700 + bar * 900, 0.16), bar * 2.0)
for t_, m in [(0.5, 72), (1.5, 75), (2.5, 77), (3.25, 80)]:
    add(vox, vchop(m, 0.5, 'a', 0.14), t_)
add(fx, riser(1.6), 2.4, 0.5)
add(fx, whoosh(0.5), 3.6, 0.5)

kicks = [x * 0.5 for x in range(8, 38)] + [x * 0.5 for x in range(44, 58)]   # 4-19, 22-29
for k in kicks:
    add(drums, kick(), k, 0.8)
for x in range(8, 38):                                          # snare on 2 & 4
    if x % 2 == 1:
        add(drums, snare(), x * 0.5, 0.6)
for x in range(45, 58, 2):
    add(drums, snare(), x * 0.5, 0.65)
for x in range(8, 24):
    add(drums, hat(x % 2 == 1, 0.35), x * 0.5 + 0.25)
for s in range(96, 152):                                        # 12-19: 16th hats
    add(drums, hat(False, 0.35 if s % 2 else 0.18), s * 0.125)
for s in range(176, 232):                                       # drop 16ths
    add(drums, hat(s % 4 == 2, 0.34 if s % 2 else 0.2), s * 0.125)
r = 18.0                                                        # snare roll into the breath
while r < 20.0:
    p = (r - 18) / 2
    add(drums, snare(), r, 0.15 + 0.4 * p)
    r += 0.25 if p < 0.5 else 0.125 if p < 0.8 else 0.0625
for i, t_ in enumerate([21.5, 21.625]):                         # tom pickup before the gap
    add(drums, tom(140 - i * 30), t_, 0.5)

duck = np.ones(N)
for k in kicks:
    i, n = T(k), T(0.3)
    j = min(N, i + n)
    duck[i:j] = np.minimum(duck[i:j], 1 - 0.85 * np.exp(-np.arange(j - i) / (0.075 * SR)))

# bass: 808 sub following roots (offbeat-ish pattern), mid bass doubles in the drop
prev = None
for bar in range(15):
    t0 = bar * 2.0
    root, chord = PROG[bar % 4]
    if not (4.0 <= t0 < 20.0 or 22.0 <= t0 < 30.0):
        continue
    for st, ln, oct_ in [(0, 0.6, 0), (6, 0.35, 0), (10, 0.3, 12), (12, 0.6, 0)]:
        m = root - 12 + oct_
        add(bass, sub808(m, ln, prev), t0 + st * 0.125, 0.55)
        prev = m
# chords: 3-3-2 supersaw stabs (sustained pad in the first verse)
for bar in range(15):
    t0 = bar * 2.0
    root, chord = PROG[bar % 4]
    if 4.0 <= t0 < 12.0:
        add(synth, pad(chord, 2.05, 2400, 0.22), t0)
        for st in STABS:
            add(synth, stab(chord, 0.14, 3400, 0.3), t0 + st * 0.125)
    elif 12.0 <= t0 < 20.0:
        for st in STABS + [14]:
            add(synth, stab(chord, 0.15, 3600 + (t0 - 12) * 400, 0.34), t0 + st * 0.125)
    elif 20.0 <= t0 < 22.0:
        add(synth, pad(chord, 2.0, 500, 0.12), t0)          # breath: muffled pad
    elif t0 >= 22.0:
        for st in STABS + [14]:
            add(synth, stab(chord, 0.16, 6000, 0.26), t0 + st * 0.125)

# drop hook (22-29)
HOOK = [(0, 77, 2), (2, 80, 2), (4, 77, 1), (5, 75, 1), (6, 72, 2), (10, 75, 2), (12, 77, 4),
        (16, 80, 2), (18, 82, 2), (20, 80, 1), (21, 77, 1), (22, 75, 2), (26, 72, 2), (28, 77, 4)]
pv = None
for rep, base in enumerate([22.0, 26.0]):
    for st, m, ln in HOOK:
        t_ = base + st * 0.125
        if t_ >= 29.4:
            continue
        add(leadb, lead(m, ln * 0.125 + 0.05, pv), t_)
        pv = m
for t_ in [22.75, 23.75, 24.75, 25.75, 26.75, 27.75]:            # "ey" chops on offbeats
    add(vox, vchop(chord_at(t_)[1][2] + 12, 0.16, 'e', 0.22), t_)
add(vox, vchop(84, 0.35, 'e', 0.35), 22.0)                       # 'HEY' on the drop
add(vox, vchop(72, 0.35, 'a', 0.3), 21.0)                        # breath cue

# picture-locked fx
cuts = [4 + i for i in range(8)] + [12 + 0.5 * i for i in range(12)]
for t_ in cuts:
    add(fx, whoosh(0.18), t_ - 0.12, 0.25)
for i in range(16):
    add(fx, tick(2400 + i * 120, 0.12), 18.0 + i * 0.125)
add(fx, riser(2.0), 18.0, 0.7)
add(fx, whoosh(0.8, False), 20.0, 0.45)
add(fx, rev_cymbal(0.85), 20.9, 0.7)
add(fx, impact(1.0), 22.0)
add(fx, impact(0.5), 28.0)
for t_ in [12.0, 16.0]:
    add(fx, whoosh(0.4), t_ - 0.2, 0.4)

# silent pre-drop gap: 21.78-22.0 everything but the reverse cymbal tail drops out
gap = np.ones(N)
a_, b_ = T(21.78), T(22.0)
gap[a_:b_] = 0.0
gap[a_ - T(0.02):a_] = np.linspace(1, 0, T(0.02))

# ---------- mix ----------
ir_n = T(1.4)
ir = lp(rng.standard_normal(ir_n) * env(ir_n, 0.28), 8000)
ir /= np.sqrt(np.sum(ir ** 2))
music = drums + 0.75 * bass * duck + 2.2 * synth * (0.35 + 0.65 * duck) + 1.3 * leadb * (0.6 + 0.4 * duck) + 1.4 * vox
wet = fftconvolve(synth * duck * 0.5 + leadb * 0.6 + vox + 0.15 * drums, ir)[:N] * 0.28
mix = (music + wet) * gap + fx
mix = hp(mix, 28)
mix = np.tanh(mix * 1.5) / np.tanh(1.5)
mix *= 0.9 / np.max(np.abs(mix))
mix[T(29.25):] *= np.linspace(1, 0, N - T(29.25)) ** 2
right = mix.copy()
d = T(0.012)
right[d:] = 0.82 * mix[d:] + 0.18 * mix[:-d]
pcm = (np.clip(np.stack([mix, right], 1), -1, 1) * 32767).astype('<i2')
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('ok')
