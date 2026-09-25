# 강성준 — Research in Motion

15초 한글 연구 이력 쇼릴. 세포 → 데이터 → 연구 규모 → 항체 후보 연구 → 강성준의 순서로 전개됩니다.

**완성 영상:** [Seong-Jun-Kang-KO-15s.mp4](output/Seong-Jun-Kang-KO-15s.mp4)
**스토리보드:** [storyboard.jpg](output/storyboard.jpg)

- 1920 × 1080, 60 fps, 정확히 15초 / H.264 + AAC 스테레오
- Pretendard 한글 타이포그래피, 회전하는 2,300개 입자, 세포에서 군집으로 변형, 대각선 셔터 전환, 항체 선 드로잉
- 120 BPM 오리지널 합성 음악, 전환 효과음, 마지막 3초 이름과 웹사이트 노출
- 모든 과학 그래픽은 개념적 시각화이며 실제 실험 데이터나 분석 결과를 표현하지 않습니다.

## 구성과 출처

내용 출처: [kangseongjun.com](https://kangseongjun.com/), 2026-09-25 확인.

| 구간 | 화면 | 근거 |
| --- | --- | --- |
| 0–3초 | 세포를 읽고, 가능성을 열다. | 실험 면역학과 단일세포·공간 분석을 연결하는 연구 프로필을 바탕으로 한 창작 카피 |
| 3–6초 | 면역학 × 데이터 × AI | 단일세포·공간 오믹스, 멀티모달 딥러닝, Python·R 분석 경력 |
| 6–9초 | 700+명 / 8개 장기 | SCAID 프로젝트 참여. 해당 프로젝트의 규모이며 개인 단독 실적이 아님. 다기관 QC 및 연구 조율 |
| 9–12초 | 데이터에서 치료의 가능성으로. | PB Immune Therapeutics의 anti-CD40 후보 평가 및 전임상 연구. 동료심사 논문 17편, 서울대학교 의생명과학 박사 |
| 12–15초 | 강성준 / kangseongjun.com | 영문 이름, 학위, 연구 분야, Boston 소재 정보 |

심사 중인 논문을 출판된 논문 수에 포함하지 않았습니다. 항체 연구를 승인된 치료제로 표현하지 않았습니다.

## 재생성

Python 3.10 이상에서 실행합니다. FFmpeg 실행 파일은 `imageio-ffmpeg` 패키지가 제공합니다.

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python render.py
```

구도 미리보기만 생성하려면 `render.py --preview`를 사용합니다. 모든 결과는 `output/`에 저장됩니다. 랜덤 시드를 고정해 재현할 수 있습니다.

Pretendard 글꼴은 SIL Open Font License로 포함했습니다. [라이선스](assets/FONT-LICENSE.txt). 음악은 렌더 스크립트에서 직접 합성하며 외부 음원 샘플을 사용하지 않습니다.
