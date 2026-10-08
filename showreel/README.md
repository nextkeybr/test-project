# Claude 모션그래픽 쇼릴 (30초)

After Effects 없이 **코드만으로** 만든 30초 모션그래픽 쇼릴. 1920×1080 · 60fps · 모션블러 · 음악 포함.

## 구성 (120 BPM, 모든 컷이 박자에 맞춤)
| 시간 | 장면 | 기법 |
|---|---|---|
| 0–2s | INTRO | 점 팝업 + 충격파 → 선 → 컬러 바 → 화면 채우기 |
| 2–6s | TYPE | 키네틱 타이포 "I DON'T JUST ANIMATE / I DIRECT EVERY PIXEL." 마스크 등장, 슬램, 에코 외곽선, 픽셀 폭발 |
| 6–10s | FORM / RHYTHM | 폭발한 픽셀이 사각형으로 재조립 → 도형 모핑 → 타일 웨이브 플립 → 원형 와이프 |
| 10–14s | DEPTH | 3D 점 구체 + 정이십면체 와이어 + 궤도 링 → 터널 |
| 14–16s | FLUID | 메타볼(액체 덩어리) |
| 16–18s | DATA | 카운터, 라인/막대/도넛 차트 |
| 18–20s | ZOOM | "MOTION"의 O 속으로 줌 스루 (다음 장면이 구멍 안에 보임) |
| 20–24s | DROP | 0.25초 컷 단어 몽타주 8개 → 4분할 패널 |
| 24–26s | STATS | 슬롯머신 숫자 롤링 |
| 26–30s | RESOLVE | 로고 마크, 파티클 버스트, 워드마크 |

후처리: 서브프레임 누적 모션블러(180° 셔터), 임팩트 카메라 셰이크, 색수차, 필름 그레인, 비네팅, HUD.

## 실행
```bash
pip install numpy scipy pillow
python music.py build/music.wav                       # 음악 합성
node render.mjs preview 2.5 5.3 19.8                  # 특정 시점 스틸 (preview/)
node render.mjs video --workers 4 --samples 5         # 영상 렌더 (build/video.mp4)
ffmpeg -i build/video.mp4 -i build/music.wav -c:v copy -c:a aac -b:a 320k -shortest claude_showreel.mp4
```
필요: Node + Playwright(Chromium), ffmpeg, Inter / Inter Display 폰트.
