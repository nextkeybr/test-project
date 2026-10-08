# KEEP GOING — 노력의 결과는 달콤하다 (30초 모션그래픽)

After Effects 없이 코드만으로 만든 30초 모션그래픽. 1920×1080 · 60fps · 모션블러 · 음악 포함.

## 스토리 (120 BPM, 모든 동작이 박자에 맞춤)
| 시간 | 장 | 내용 |
|---|---|---|
| 0–4s | TRY | 공이 색 계단을 오르며 계단 색을 흡수 → 높은 계단에 부딪혀 실패 → 웅크렸다 재도전 성공 → 발사 |
| 4–8s | FALL → CHANGE | 추락·산산조각 → 삼각형으로 재조립 → 박자마다 변신하며 자기 색을 배경 전체로 퍼뜨림 |
| 8–12s | MERGE | 7개 색 덩어리가 액체처럼 합쳐져 하나의 다색 소용돌이로 |
| 12–16s | BREAK | 폭발해 색종이 도형으로 분해 → 소용돌이 → 한 점으로 수렴 |
| 16–20s | REBUILD | 바우하우스 패턴 타일로 재조립, 회전·색 전환, 빌드업 |
| 20–24s | KEEP GOING | 입체 타이틀 슬램 + 사방으로 흐르는 텍스트 + 무지개 리본 와이프 |
| 24–30s | SWEET | 도형 22개가 날아와 변형되며 사탕으로 조립 → 광택·반짝임 → "EFFORT TASTES SWEET." |

## 실행
```bash
pip install numpy scipy pillow
python music.py build/music.wav
node render.mjs preview 2.5 12.1 26.6       # 스틸 (preview/)
node render.mjs video --workers 4 --samples 5
ffmpeg -i build/video.mp4 -i build/music.wav -c:v libx264 -crf 17 -c:a aac -b:a 320k -shortest keep_going.mp4
```
