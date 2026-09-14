import type { DailyRecord, ErrorCode, Fixture, Status } from '../types';
import { nowRfc3339Kst } from './dateKst';

const BASE = import.meta.env.BASE_URL ?? '/';

export const FAILURE_FIXTURES: Array<{
  id: string;
  errorCode: ErrorCode;
  label: string;
}> = [
  { id: 'T04-FAIL-SLOW', errorCode: 'slow', label: '느린 응답' },
  { id: 'T04-FAIL-401-403', errorCode: 'auth_rejected', label: '401/403 거절' },
  { id: 'T04-FAIL-RATE-LIMIT', errorCode: 'rate_limited', label: '호출 제한' },
  { id: 'T04-FAIL-OFFLINE', errorCode: 'offline', label: '오프라인' },
  { id: 'T04-FAIL-SCHEMA', errorCode: 'schema_changed', label: '형식 변경' },
];

export const RECOVERY_FIXTURE_ID = 'T04-RECOVER-D2';

/**
 * fixture 파일을 로드한다.
 */
export async function loadFixture<T extends Fixture = Fixture>(
  id: string,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${BASE}fixtures/${id}`, { signal });
  if (!res.ok) {
    throw new Error(`fixture ${id} 로드 실패: ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * 실패 fixture를 재생한 결과 상태를 반환한다.
 * 이 함수는 "외부 실패를 재현"하는 것이며, 실제 네트워크를 건드리지 않는다.
 */
export interface FailureResult {
  status: Status;
  errorCode: ErrorCode;
  label: string;
  description: string;
}

export function makeFailureState(fixture: Fixture): FailureResult {
  return {
    status: 'error',
    errorCode: fixture.error_code,
    label: fixture.label,
    description: fixture.description,
  };
}

/**
 * 복구 fixture를 재생해 "다음 날짜의 일별 기록 1건"을 만든다.
 * (C19: 상태가 fresh, error_code가 none으로 돌아오고,
 *       다음 날짜의 일별 기록이 정확히 1건 추가)
 */
export interface RecoveryFixtureShape extends Fixture {
  recovery_top_keywords: Array<{ keyword: string; count: number }>;
  primary_keyword: string;
  primary_count: number;
  target_date_kst: string;
}

export function makeRecoveryRecord(
  fixture: RecoveryFixtureShape,
): DailyRecord {
  return {
    date_kst: fixture.target_date_kst,
    queried_at: nowRfc3339Kst(),
    source_url: 'https://hn.algolia.com/api/v1/search_by_date',
    source_observed_at: `${fixture.target_date_kst}T23:59:59+09:00`,
    primary_keyword: fixture.primary_keyword,
    primary_count: fixture.primary_count,
    top_keywords: fixture.recovery_top_keywords,
    // 복구 fixture는 합성 원자료를 담는다.
    raw: {
      hits: [],
      nbHits: fixture.primary_count,
      page: 0,
      nbPages: 0,
      hitsPerPage: 0,
      query: '(synthetic recovery fixture)',
    },
  };
}

/**
 * 실패 상태에서 사용자가 취할 다음 행동을 안내한다.
 * (C19: 다시 시도 행동이 보여야 함)
 */
export function nextActionFor(errorCode: ErrorCode): string {
  switch (errorCode) {
    case 'slow':
      return '잠시 후 다시 시도하세요. 응답이 임계 시간을 초과했습니다.';
    case 'auth_rejected':
      return '인증/권한 문제입니다. 원천 접근 권한을 확인한 뒤 다시 시도하세요.';
    case 'rate_limited':
      return '호출 제한에 걸렸습니다. 잠시 기다린 뒤 다시 시도하세요.';
    case 'offline':
      return '네트워크 연결을 확인한 뒤 다시 시도하세요.';
    case 'schema_changed':
      return '원천 응답 형식이 변경되었습니다. 계약을 확인한 뒤 다시 시도하세요.';
    case 'none':
      return '정상 상태입니다.';
  }
}