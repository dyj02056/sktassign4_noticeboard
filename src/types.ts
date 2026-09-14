// 공개 원천 정의
export interface SourceInfo {
  name: string;
  url: string;
  requiresSecret: boolean;
}

// 키워드 집계 결과 항목
export interface KeywordCount {
  keyword: string;
  count: number;
}

// 하루치 집계 결과
export interface DayAggregate {
  primaryKeyword: string;      // 주 값: 1위 키워드
  primaryCount: number;        // 주 값: 1위 키워드 출현 횟수
  topKeywords: KeywordCount[]; // Top 5
}

// 원자료 응답 (HN Algolia)
export interface RawHit {
  objectID: string;
  title: string | null;
  created_at: string;          // ISO 8601
  created_at_i: number;        // Unix timestamp
  url: string | null;
  points: number | null;
}

export interface RawResponse {
  hits: RawHit[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  query: string;
}

// 일별 기록 (저장값)
export interface DailyRecord {
  date_kst: string;            // "YYYY-MM-DD"
  queried_at: string;          // RFC 3339
  source_url: string;
  source_observed_at: string;  // 해당 날짜의 대표 관측 시각
  primary_keyword: string;
  primary_count: number;
  top_keywords: KeywordCount[];
  raw: RawResponse;            // 원자료 스냅샷
}

// 실패 상태
export type ErrorCode =
  | 'none'
  | 'slow'
  | 'auth_rejected'
  | 'rate_limited'
  | 'offline'
  | 'schema_changed';

export type Status = 'fresh' | 'stale' | 'error';

// 정보판 상태
export interface BoardState {
  status: Status;
  errorCode: ErrorCode;
  lastKnownGood: DailyRecord | null;
  records: DailyRecord[];       // 일별 기록 목록
  isReplaying: boolean;
}

// Fixture
export interface Fixture {
  fixture_id: string;
  synthetic: true;
  scenario: string;
  error_code: ErrorCode;
  label: string;
  description: string;
  [key: string]: unknown;       // fixture별 추가 필드
}