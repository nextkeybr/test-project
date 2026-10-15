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
| 20–22s | 빨려 들어가고 창살 문이 닫힘, 음악이 멎고 문 너머로 "어서와" 그림자 |
| 22–30s | 문이 열리며 드롭 → "어서와" + 단청 띠 + WELCOME TO KOREA |

한국적 포인트: 오방색 팔레트, 亞자 창살 무늬, 한지 질감과 빛, 단청 띠 전환, 가야금풍 뜯는 소리(합성)와 북.

## 실행
```bash
./fonts.sh                                   # Pretendard + Noto(태국어·힌디·아랍어·중국어) 설치
pip install numpy scipy pillow
python music.py build/music.wav
node render.mjs preview 4.3 14.2 21.5 25    # 스틸 (preview/)
node render.mjs video --workers 4 --samples 5
ffmpeg -i build/video.mp4 -i build/music.wav -c:v libx264 -crf 17 -c:a aac -b:a 320k -shortest welcome.mp4
```
