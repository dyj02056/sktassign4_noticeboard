# 오늘의 진짜 정보판 — HN 트렌드 보드 (과제 04)

> 매일 변하는 Hacker News 키워드 트렌드를 기록하고, 어제와 비교하며, 외부 데이터가 오지 않을 때도 마지막 정상값을 보존하고 상태를 정직하게 설명하는 정보판.

---

## 결과물 주소

- **공개 심사 화면**: (https://sktassign4-noticeboard-kt7g.vercel.app)
- **소스 저장소**: (https://github.com/dyj02056/sktassign4_noticeboard/commit/19f243c6019d42e17788f1e1dae084e0a2ce3ca1)

---

## 이 정보판이 다루는 값

| 항목 | 내용 |
|---|---|
| 원천 | Hacker News (Algolia Search API, `https://hn.algolia.com/api/v1/search_by_date`) |
| 비밀키 | **불필요** (CORS 허용, 브라우저 직접 호출) |
| 정의 | 특정 KST 날짜 하루 동안 생성된 HN 스토리(`tags=story`)의 제목을 토큰화·집계하여, 가장 많이 등장한 키워드 Top 5를 산출 |
| **주 값** | 오늘 1위 키워드의 출현 횟수 |
| **보조 값** | Top 2~5 키워드와 각 출현 횟수 |
| 단위 | 건 |
| 출처 시각 | 각 스토리의 `created_at` (원천 제공) |
| 조회 시각 | 정보판이 기록 |
| 기준 시간대 | Asia/Seoul (KST) |

**집계 규칙** (고정, `public-contract.json`에 명시):
1. 제목을 소문자화
2. 영숫자 외 문자를 구분자로 토큰화
3. 표준 영어 불용어 + HN 특유 불용어 제거
4. 길이 2 미만 토큰 제거
5. 출현 횟수 집계
6. 출현 횟수 내림차순, 동률이면 사전순 오름차순 정렬
7. 상위 5개 취함

**예시**: 오늘 HN 스토리 제목들을 집계했더니 `ai`가 12건으로 1위, `model` 9건, `rust` 7건, `security` 6건, `browser` 5건이면 → 주 값은 **12건 (ai)**. 내일 1위가 `rust` 15건이면 어제 대비 **+3**이고 1위 키워드가 바뀐 것.

---

## 파일 목록과 역할

├── README.md ← 이 파일 (진입점)
├── index.html
├── package.json
├── vite.config.ts
├── src/ ← 정보판 화면 코드
├── docs/
│ ├── submission-note.md ← 과정 누적 기록물
│ └── submission-checklist.md ← 제출 준비 항목 정리
└── public/
├── public-contract.json ← 데이터 계약서 (집계 규칙 포함)
├── asset-manifest.json ← 공개 asset 목록 + SHA-256
├── data/ ← 일별 기록 JSON (D1, D2...)
└── fixtures/ ← 실패 5종 + 복구 합성 asset
├── T04-FAIL-SLOW
├── T04-FAIL-401-403
├── T04-FAIL-RATE-LIMIT
├── T04-FAIL-OFFLINE
├── T04-FAIL-SCHEMA
└── T04-RECOVER-D2


---

## 공개 확인 URL (배포 후)

| 자원 | URL |
|---|---|
| 정보판 화면 | `https://<배포도메인>/` |
| 데이터 계약서 | `https://<배포도메인>/public-contract.json` |
| Asset 매니페스트 | `https://<배포도메인>/asset-manifest.json` |
| Fixture (예: 복구) | `https://<배포도메인>/fixtures/T04-RECOVER-D2` |

---

## 짧은 확인 방법 (4줄)

1. **어디로 가나요**: `<Vercel 배포 URL>`
2. **무엇을 하나요 (3단계 이내)**:
   1) 화면 상단에서 오늘의 Top 5 키워드와 주 값(1위 키워드 출현 횟수)을 확인한다
   2) "실패 재생" 버튼으로 5가지 실패 상태를 차례로 재생한다
   3) "복구 재생"으로 상태가 fresh로 돌아오고 일별 기록이 1건 추가되는지 확인한다
3. **무엇이 보이면 통과**: 값·단위·출처·출처 시각·조회 시각·기준 시간대가 한 화면에 보이고, 실패 시 마지막 정상값에 "오래된 값" 표시가 붙고, 복구 후 fresh로 돌아온다
4. **안 될 때**: 데이터가 안 오면 "오래된 값" 배지와 실패 사유가 표시되고, "다시 시도" 버튼이 나타난다

---

## SHA-256 검증 방법

`asset-manifest.json`에 6개 fixture의 SHA-256이 기록되어 있습니다. 심사자는 각 파일을 내려받아 해시를 재계산해 무결성을 검증합니다.

**Windows**:
```powershell
Get-FileHash -Algorithm SHA256 T04-FAIL-SLOW

개인정보 및 비밀키
개인정보 0건: 이 저장소와 배포 화면에는 실제 개인정보가 포함되지 않습니다.

비밀키 0건: 브라우저 코드·배포 파일·네트워크 응답·Git 기록 어디에도 비밀키 원문이 없습니다. HN Algolia API는 키가 필요 없습니다.

합성값만: 실패 재생에 쓰이는 6개 fixture는 모두 합성 시험값이며, "synthetic": true로 명시되어 있습니다.

기술 스택
Vite + React + TypeScript

Tailwind CSS v4 (@tailwindcss/vite 플러그인)

Motion (motion/react)

Phosphor Icons

배포: Vercel (정적 빌드)

AI와 나의 판단
AI에게 맡긴 일: HN Algolia API 조사, 데이터 계약·fixture·매니페스트 설계, 집계 규칙 초안, 화면 코드 작성, 실패 5종 처리 구조 제안

내가 판단한 일: 데이터 주제 선정(HN 키워드 트렌드), 기술 스택 선택, KST 날짜 경계 규칙 확정, 배포 방식 결정, 고정 키워드 → 동적 Top 5 방식으로 변경 결정

AI 제안을 따르지 않은 일: (진행하며 기록, 없으면 "없음"과 이유)

자세한 과정은 docs/submission-note.md 참조.

심사 재현 절차
위 "짧은 확인 방법"의 4줄을 따라 정보판에 접속한다

화면에 표시된 값·단위·출처·출처 시각·조회 시각·기준 시간대를 확인한다

public-contract.json과 asset-manifest.json을 URL로 열어 계약(집계 규칙 포함)과 해시를 확인한다

실패 5종을 재생한 뒤 마지막 정상값과 "오래된 값" 표시를 확인한다

T04-RECOVER-D2를 재생해 상태가 fresh로 돌아오고 일별 기록이 1건 추가되는지 확인한다

text

---

