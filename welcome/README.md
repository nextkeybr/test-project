# 어서와 — 세계의 인사 타이포 모션그래픽 (30초)

프리텐다드로 만든 타이포그래피 모션그래픽. 세계 20개 언어의 인사가 박자에 맞춰 이어지다 "어서와"로 끝난다.
1920×1080 · 60fps · 모션블러 · 음악 포함. After Effects 없이 코드로 제작.

## 구성 (120 BPM)
| 시간 | 장면 |
|---|---|
| 0–4s | 밤, 빛이 켜지는 한지 창살 화면에 "Hello"가 그림자로 맺힘 → 창살 속으로 줌 |
| 4–12s | 1초마다 인사 8개 (Hola · Bonjour · Ciao · こんにちは(세로쓰기) · Olá · Привет · 你好 · Merhaba) |
| 12–18s | 0.5초마다 인사 12개 (Hallo · Xin chào · สวัสดี · नमस्ते · مرحبا(오른쪽→왼쪽) · Γειά σου …) |
| 18–20s | 인사가 화면을 가득 채움 |
| 20–22s | 인사가 한 점의 빛으로 모임 → 처마선이 펼쳐지고 지붕 실루엣·단청 띠·서까래 마구리 무늬가 등장, 드롭 직전 무음 |
| 22–30s | 단청 줄무늬 와이프로 드롭 → "어서와" 한 글자씩 등장, 박자마다 튀고 오방색으로 뒤집힘, 외곽선 파동, 세계의 '환영' 문구 흐름 |

한국적 포인트: 오방색 팔레트, 亞자 창살 무늬, 한지 질감과 빛, 처마 실루엣, 단청 띠와 서까래 마구리 무늬.
음악: K-pop 댄스 스타일(120 BPM, F단조) — 4온더플로어 킥, 808 베이스, 3-3-2 슈퍼쏘 스탭, 리드 훅, 보컬 찹, 드롭 직전 무음.

## 실행
```bash
./fonts.sh                                   # Pretendard + Noto(태국어·힌디·아랍어·중국어) 설치
pip install numpy scipy pillow
python music.py build/music.wav
node render.mjs preview 4.3 14.2 21.5 25    # 스틸 (preview/)
node render.mjs video --workers 4 --samples 5
ffmpeg -i build/video.mp4 -i build/music.wav -c:v libx264 -crf 17 -c:a aac -b:a 320k -shortest welcome.mp4
```
