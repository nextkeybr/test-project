"""Fit a supplied track (Suno, 124.94 BPM) to the 어서와 edit (120 BPM, drop at 22.0s).

1. time-stretch to 120 BPM with rubberband (pitch preserved) — 1 bar = exactly 2.0s
2. splice bars so: video 0-4 intro pads, 4-20 verse (last bar = pre-break), 20-22 last break bar,
   22-30 first drop; 12 ms equal-power crossfades on every splice, fade-out at the end.
usage: python fit.py in.wav out.wav
"""
import subprocess
import sys
import tempfile
import wave

import numpy as np

SRC_BPM, DST_BPM = 124.94, 120.0
D_ORIG = 47.715                       # first kick of the drop in the original
SR = 48000
R = DST_BPM / SRC_BPM                 # tempo factor (<1 = slower)
BAR = 2.0                             # one bar after stretching

src, dst = sys.argv[1], sys.argv[2]
tmp = tempfile.mktemp(suffix='.wav')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af',
                f'rubberband=tempo={R:.6f}:transients=crisp:pitchq=quality', '-ar', str(SR), '-ac', '2', tmp], check=True)
w = wave.open(tmp)
x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, 2).astype(np.float32) / 32768
D = D_ORIG / R                        # drop time in the stretched track


def seg(bar_from, bar_to):
    """bars relative to the drop (negative = before)."""
    a, b = int(round((D + bar_from * BAR) * SR)), int(round((D + bar_to * BAR) * SR))
    return x[a:b]


# (source bars relative to drop) -> placed back to back from t=0
plan = [(-18, -16),   # video 0-4   : intro pads
        (-11, -3),    # video 4-20  : verse, ends on the strongest pre-break bar
        (-1, 0),      # video 20-22 : last (quiet) bar of the break
        (0, 4.2)]     # video 22-30 : drop
X = 12 * SR // 1000
out = np.zeros((0, 2), np.float32)
for a, b in plan:
    s = seg(a, b).copy()
    if len(out) and len(s) > X:
        f = np.linspace(0, 1, X)[:, None]
        head = s[:X] * np.sin(f * np.pi / 2) + out[-X:] * np.cos(f * np.pi / 2)
        out = np.concatenate([out[:-X], head, s[X:]])
    else:
        out = np.concatenate([out, s])
N = 30 * SR
out = out[:N] if len(out) >= N else np.pad(out, ((0, N - len(out)), (0, 0)))
fade = np.ones(N, np.float32)
fade[int(29.2 * SR):] = np.linspace(1, 0, N - int(29.2 * SR)) ** 2
out *= fade[:, None]
out *= 0.95 / max(1e-6, np.abs(out).max())
with wave.open(dst, 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
print('drop in stretched track at %.3fs -> placed at 22.000s' % D)
