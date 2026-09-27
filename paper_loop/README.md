# 경복궁 종이 모션 낮↔밤 루프

Nano Banana 2(Higgsfield)로 레이어를 따로 만들고, `render.py`로 합성해 루프 영상을 만든다.

## 레이어 (`raw/` 폴더에 PNG로)
| 파일 | 내용 | 배경 |
|---|---|---|
| `bg_night.png` | 남색 종이 하늘 | 전체 |
| `bg_day.png` (선택) | 크림색 종이 하늘. 없으면 밤 종이 질감으로 자동 생성 | 전체 |
| `sun.png`, `moon.png` | 해 / 보름달 | 마젠타 #FF00FF |
| `clouds.png` | 떨어진 구름 4조각 (자동 분리) | 마젠타 |
| `mountains_far.png`, `hills_near.png` | 먼 산 / 가까운 언덕 | 마젠타 |
| `palace_day.png`, `palace_night.png` | 근정전 낮/밤 (같은 구도) | 마젠타 |
| `pine.png` | 앞쪽 소나무 | 마젠타 |

## 실행
```bash
pip install pillow numpy scipy imageio-ffmpeg
python render.py raw preview.jpg --preview   # 6컷 미리보기
python render.py raw loop.mp4 --seconds 12 --fps 24
```

## 움직임
- 해가 산 뒤로 지고 → 달이 떠오름 → 다시 해 (t=0과 t=1이 같은 프레임이라 끊김 없이 루프)
- 구름: 좌우로 흐르다 화면 밖에서 반대편으로 돌아옴
- 산/언덕: 서로 반대 방향으로 살짝 흔들림(시차 효과)
- 소나무: 밑동 기준으로 흔들림
- 모든 레이어에 작은 떨림(paper boil) + 2프레임씩 끊어 그리기(12장/초) → 스톱모션 종이 느낌
- 해질녘 주황빛, 밤에 별 반짝임, 달무리
