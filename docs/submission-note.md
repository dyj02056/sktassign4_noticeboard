# Submission Note — 오늘의 진짜 정보판 (과제 04)

> 과정 누적 기록물. 모든 결정·시행착오·검증을 시간순으로 기록한다.
> 최종 갱신: 2026-09-14 (KST, D1)

---

## 0. 과제 개요

- **과제**: 오늘의 진짜 정보판 — 데이터가 안 올 때 (과제 04)
- **핵심 목적**: 외부 데이터가 늦거나 오류가 발생할 때 마지막 정상값을 보존하고 현재 상태를 정직하게 설명하여 신뢰성을 확보하는 구조 설계
- **일정**: 실제 KST 날짜 2일 필요 (D1 = 2026-09-14, D2 = 다음 KST 자정 이후)

---

## 1. 심문(grilling)과 확정 사항

`grill-me` 스킬 취지에 따라 설계 확정 전 스스로를 집요하게 심문했다.
비전공자도 이해할 수 있도록 각 항목에 예시를 붙였다.

### 심문 #1 — 일정 (확정)

- **질문**: D1을 오늘로 잡아도 되는가? 서로 다른 Asia/Seoul 실제 날짜 2건(C22)이 필요하다.
- **답변**: 
  - D1 = 지금 이 KST 날짜 (이미 자정을 넘긴 상태, 오늘 안에 D1 조회·저장 완료)
  - D2 = 다음 KST 자정이 지나 새 날짜가 시작되면 조회 가능
  - 대기 시간은 작업시간에 불포함 (과제 명세)
- **확정**: KST 자정 경계만 넘기면 D2 성립 → C22 충족

### 심문 #2 — 데이터 소스 (확정)

- **질문**: 어떤 공개 데이터를 쓸 것인가?
- **조건**: 비밀키 불필요(C11) + 출처 시각 제공(C03~C09) + 어제 대비 변동(C24) + IT 최신 근황 주제
- **검토 후보**: OSV.dev, NVD CVE, URLhaus, EPSS(CIRCL), Feodo Tracker, Hacker News
- **최종 확정**: 
  - **소스**: Hacker News Algolia 검색 API (`https://hn.algolia.com/api/v1/search_by_date`)
  - **비밀키**: 불필요
  - **정의**: 특정 KST 날짜 하루 동안 생성된 HN 스토리(`tags=story`) 중, 제목에 키워드가 포함된 스토리 수
  - **값**: 응답 JSON의 `nbHits`
  - **단위**: 건
  - **키워드**: `AI`(주 값) + `security`(보조) + `LLM`(보조)
  - **출처 시각**: 각 스토리의 `created_at` 필드 (원천 제공)
  - **어제 대비 변화**: D1 `nbHits` - D2 `nbHits` (주 값 AI 기준 C24 검증)
  - **CORS**: 허용 → 클라이언트 직접 호출 가능, 서버 불필요

**비전공자용 예시**:
오늘 HN에 올라온 스토리 제목 중 "AI"가 들어간 게 3개면 값은 3. 내일 7개면 어제 대비 +4.

### 심문 #3 — 기술 스택 (확정)

- **확정**: Vite + React + Tailwind v4
- **모션**: Motion (`motion/react`)
- **아이콘**: Phosphor 또는 Tabler (Lucide 지양)
- **언어**: TypeScript
- **빌드 산출물**: 정적 파일 (`dist/`)

### 심문 #4 — 배포 (확정)

- **배포**: Vercel (정적 빌드, 서버 함수 미사용 → 용량 영향 0)
- **소스 저장소**: 사용자가 직접 GitHub 저장소 생성·푸시
- **결과물 URL**: Vercel 배포 URL
- **소스 URL**: GitHub commit hash 포함 고정 URL

**Vercel 용량 영향 분석** (사용자 우려 해소):
| 항목 | 이 프로젝트 사용량 |
|---|---|
| Functions Storage | 0 GB (서버 함수 안 씀) |
| Fluid Active CPU | 0초 |
| Fluid Provisioned Memory | 0 |
| Edge Requests | 심사 접속 수십 회 수준 |

### 심문 #5 — 문서 구조 (확정)
├─ src/
├─ public/
│ ├─ data/ # 일별 기록 JSON (D1, D2...)
│ └─ fixtures/ # 실패 5종 합성 fixture
├─ docs/
│ ├─ submission-note.md # 과정 누적 기록물 (이 파일)
│ └─ submission-checklist.md # 제출 준비 항목 정리
├─ README.md
├─ package.json
└─ ...

### 심문 #6 — 참조 파일 (확정)

- **설계 주체**: 에이전트가 직접 설계
- **설계 문서화**: 각 파일의 목적·형식·역할·SHA-256 생성 방식을 자세히 설명
- **설명 위치**: `README.md` + 본 문서
- **설계할 파일 4종**: `README.md`, `public-contract.json`, `asset-manifest.json`, `T04-RECOVER-D2`

---

## 2. 작업 순서 (확정)

1. `docs/submission-note.md` 생성 ← **현재 단계**
2. 프로젝트 스캐폴딩 (Vite + React + Tailwind v4)
3. 참조 파일 설계 (README, public-contract.json, asset-manifest.json, T04-RECOVER-D2) + SHA-256 계산
4. 코어 구현 (HN Algolia 호출, KST 날짜 키, 일별 기록, 어제 대비 계산)
5. 실패 5종 + 복구 (fixture 합성 재생, 마지막 정상값 보존, stale 표시)
6. 화면 구현 (3열 대조 뷰, 상태 배지, design-taste-frontend 범위 한정 적용)
7. `docs/submission-checklist.md` 작성
8. D1 실제 조회·저장 (오늘 안)
9. D2 실제 조회·저장 (다음 KST 자정 이후, 별도 세션)

---

## 3. 스킬 적용 기록

- **`grill-me`**: 설계 확정 전 6개 심문 수행 (본 문서 Section 1)
- **`design-taste-frontend`**: 화면 구현 단계에서 적용 예정. 단, 이 스킬 Section 13이 "대시보드·데이터 테이블은 out of scope"라 명시 → 마케팅 표면(헤더·여백·타이포·컬러·상태 배지·AI Tell 회피·pre-flight 접근성)에만 한정 적용
- **`caveman-compress`**: 본 문서가 커지면 적용 검토 (선택)

---

## 4. 진행 로그

### 2026-09-14 (D1)

- 심문 #1~#6 완료, 모든 설계 확정
- `docs/submission-note.md` 생성 (본 파일)

---

*(이후 모든 결정·시행착오·검증을 이 Section 4에 시간순으로 누적한다.)*
### 2026-09-14 (D1) — 2단계 완료

- Vite + React + TypeScript 프로젝트 생성 완료 (`npm create vite@latest . -- --template react-ts`)
- GitHub 저장소 clone 후 현재 폴더에 생성
- 의존성 설치 완료: `npm install`
- 추가 패키지 설치 완료: `tailwindcss @tailwindcss/vite motion @phosphor-icons/react`
- `found 0 vulnerabilities` 확인
- `npm run dev` → `http://localhost:5173/` 정상 기동 확인
- 시행착오: 최초에 하위 폴더 중첩 생성 문제 발생 → 전체 삭제 후 GitHub clone 기반으로 재시작

### 2026-09-14 (D1) — 3단계 완료

- `vite.config.ts`: `@tailwindcss/vite` 플러그인 연결
- `src/index.css`: `@import "tailwindcss";` + 기본 리셋 + `color-scheme` 설정
- `index.html`: 타이틀 변경
- `src/App.tsx`: 임시 확인 화면으로 교체 → Tailwind v4 정상 연결 확인