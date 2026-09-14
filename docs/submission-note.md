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
- **결과물 URL**:(https://sktassign4-noticeboard-kt7g.vercel.app/)
- **소스 URL**: https://github.com/dyj02056/sktassign4_noticeboard/commit/897cc774133c09b09e53b4a8d03c03758a67b5c2

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

### 2026-09-14 (D1) — 4-2 완료

- `public/fixtures/` 폴더에 fixture 6종 생성 (확장자 없음, JSON 내용)
  - `T04-FAIL-SLOW` (C12, 느린 응답)
  - `T04-FAIL-401-403` (C13, 401/403 거절)
  - `T04-FAIL-RATE-LIMIT` (C14, 호출 제한)
  - `T04-FAIL-OFFLINE` (C15, 오프라인)
  - `T04-FAIL-SCHEMA` (C16, 형식 변경)
  - `T04-RECOVER-D2` (C19, 복구)
- 모든 fixture에 `"synthetic": true` 명시 → C26 충족
- 시행착오: Windows 메모장이 `.txt`를 자동으로 붙이는 문제 → VS Code로 저장하여 확장자 없이 생성

### 2026-09-14 (D1) — 4-3 완료

- `public/asset-manifest.json` 생성
- fixture 6종 SHA-256 확정 (PowerShell `Get-FileHash` 사용)
- 각 해시를 `assets[].sha256`에 박음
- 심사자 검증 명령어 (`verify_instructions`) 포함
- 배포 시 `/asset-manifest.json`으로 URL 접근 가능

### 2026-09-14 (D1) — 주제 변경: 고정 키워드 → 동적 Top 5

**변경 사유**: "AI, security, LLM" 3개 고정은 (1) "왜 이 3개인가"의 근거가 약하고 (2) "IT 최신 근황"을 표방하면서 고정 키워드는 그 자체가 최신이 아님.

**변경 내용**:
- 고정 키워드 3종 → **동적 Top 5 키워드** (HN 스토리 제목에서 매일 집계)
- 주 값 = 오늘 1위 키워드의 출현 횟수
- 보조 값 = Top 2~5 키워드와 각 출현 횟수
- 집계 규칙(소문자화 + 불용어 제거 + 빈도순 정렬)을 `public-contract.json`에 명시

**`pass_condition.md` 주제 대조 결과**: 주제에서 빗나가지 않음. 오히려 "실제로 변하는 값"과 "어제 대비 변화"에 더 부합. "값 하나" 요구는 "주 값 1개 + 보조 값"으로 충족.

**수정 대상 파일**:
- `public-contract.json` (keywords → aggregation_rules)
- `T04-RECOVER-D2` (recovery_values → Top 5 기반)
- `asset-manifest.json` (T04-RECOVER-D2 SHA-256 재계산)
- `README.md` (값 정의 수정)

### 2026-09-14 (D1) — fixture 수정 및 매니페스트 갱신

- `T04-RECOVER-D2` 수정: `recovery_values`(고정 키워드) → `recovery_top_keywords`(Top 5 구조) + `primary_keyword`, `primary_count`
- 나머지 5종 fixture는 그대로 유지 (키워드 무관, 실패 시나리오만 기술)
- `asset-manifest.json`의 `T04-RECOVER-D2.sha256` 갱신:
  - 기존: `76C37A300EE09FD19F77F534C834757BA98377D41B8377B78778E42C5C7F8ED6`
  - 신규: `4DDB842DE51AEAB280229344FA17C7195BBC419E8D6F402595720F2C4957DCA6`

### 2026-09-14 (D1) — README 갱신

- `README.md` 수정: 고정 키워드(AI/security/LLM) → 동적 Top 5 집계 설명으로 교체
- 집계 규칙 7단계 README에 요약 반영
- 주 값/보조 값 정의 갱신
- AI와 나의 판단 항목에 "고정 키워드 → 동적 Top 5 변경 결정" 추가

### 2026-09-14 (D1) — 5-7 taste-skill 적용 완료

- `src/index.css` 교체: 형태 토큰(카드 8px / 컨트롤 6px / 필 full), accent 1개(blue), tabular-nums, 최소 트랜지션
- `src/App.tsx` 페이지 배경 `bg-zinc-50` → `bg-zinc-100` (카드 대비 강화)
- 라이트/다크 양쪽 확인
- Pre-Flight 해당 항목 통과: em-dash 0, 퍼플 0, 3등분 카드 0, Inter 0, h-screen 0, scroll listener 0
- 스킬 out-of-scope 경고 감안해 "검증 도구 표면"에 한정 적용

### 2026-09-14 (D1) — 5-8 D1 실제 조회 완료

- `scripts/fetch-daily.mjs` 작성 (Node ESM, 집계 규칙은 src/lib/aggregate.ts와 동일)
- `package.json`에 `"fetch:daily"` 스크립트 추가
- `npm run fetch:daily` 실행 결과:
  - date_kst: 2026-09-14
  - 총 스토리: 474건
  - 주 값: 78건 (1위 키워드: ai)
  - Top 5: ai:78, agent:16, agents:14, open:14, video:13
- `public/data/2026-09-14.json` 생성
- `public/data/index.json` 갱신 (1건)
- 관찰: agent/agents가 별개로 집계됨 (계약서가 형태소 정규화를 정의하지 않음 → 의도된 동작)

### 2026-09-14 (D1) — 세션 마무리

- D1 실제 조회 및 저장 완료 (`public/data/2026-09-14.json`)
- 화면 로딩 확인 (주 값 78건, 1위 키워드 ai)
- C10 대조 뷰 3탭 일치 확인
- C12~C16 실패 5종 각각 다른 error_code 확인
- C17 마지막 정상값 보존 확인
- C18 오래된 값 표시 확인
- C19 복구 재생: fresh 복귀 + 일별 기록 2건 확인
- Git 커밋·푸시 완료
- 다음: D2(2026-09-15 KST) 조회 → C22 완성

### 2026-09-14 (D1) — 문서 3종 완료

- `docs/submission-checklist.md` 작성 (제출 준비 항목)
- `docs/structure.md` 작성 (비전공자용 구조·기능 설명)
- `README.md`에 Vercel 배포 URL 반영
- Vercel 배포 완료: https://sktassign4-noticeboard-kt7g.vercel.app
- Vercel 빌드 실패 1회 (unused import TS6133/TS6196) → import 정리 후 재배포 성공
- 학습: `npm run dev`는 타입 에러를 무시하지만 `npm run build`는 실패시킴 → 커밋 전 build 테스트 필요


### 2026-09-14 (D1) — AI와 나의 판단 항목 보강

"AI 제안을 따르지 않은 일" 3건 확정 기록:
1. 고정 키워드(AI/security/LLM) → 동적 Top 5 집계
   - 사유: "왜 이 3개인가"의 근거 약함, "IT 최신 근황"과 부정합
2. `public-contract.json` 위치: 루트 → `public/`
   - 사유: 심사자가 URL로 받아 SHA-256 검증하려면 `public/`이 자연스러움
3. 초기 후보 OSV.dev/NVD → Hacker News Algolia
   - 사유: 변동성이 눈에 잘 보이는 값이 필요하다는 판단
