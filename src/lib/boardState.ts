import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BoardState, ErrorCode, Fixture } from '../types';
import {
  buildDailyRecord,
  isStale,
  loadDailyRecords,
  upsertDailyRecord,
} from './dailyRecord';
import { aggregateDay, fetchStoriesForKstDay, HN_ALGOLIA_ENDPOINT } from './hn';
import {
  loadFixture,
  makeFailureState,
  makeRecoveryRecord,
  nextActionFor,
  RECOVERY_FIXTURE_ID,
  type FailureResult,
  type RecoveryFixtureShape,
} from './fixtures';
import { toKstDateKey } from './dateKst';

export interface UseBoardResult {
  state: BoardState;
  failure: FailureResult | null;
  nextAction: string | null;
  loading: boolean;
  error: string | null;

  // 액션
  refreshLive: () => Promise<void>;
  replayFailure: (fixtureId: string) => Promise<void>;
  replayRecovery: () => Promise<void>;
  reset: () => void;
}

const initialState: BoardState = {
  status: 'fresh',
  errorCode: 'none',
  lastKnownGood: null,
  records: [],
  isReplaying: false,
};

export function useBoard(): UseBoardResult {
  const [state, setState] = useState<BoardState>(initialState);
  const [failure, setFailure] = useState<FailureResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 로드: 배포물에 저장된 일별 기록을 읽는다.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const records = await loadDailyRecords();
        if (cancelled) return;
        const last = records.length ? records[records.length - 1] : null;
        setState((s) => ({
          ...s,
          records,
          lastKnownGood: last,
          status: last && isStale(last) ? 'stale' : 'fresh',
        }));
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** 실제 공개 원천에서 오늘 값을 조회하고 저장한다. */
  const refreshLive = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const todayKst = toKstDateKey();
      const raw = await fetchStoriesForKstDay(todayKst);
      const agg = aggregateDay(raw);
      const record = buildDailyRecord({
        dateKey: todayKst,
        aggregate: agg,
        raw,
        sourceUrl: HN_ALGOLIA_ENDPOINT,
      });
      setState((s) => {
        const merged = upsertDailyRecord(s.records, record);
        return {
          ...s,
          records: merged,
          lastKnownGood: record,
          status: 'fresh',
          errorCode: 'none',
        };
      });
      setFailure(null);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      // 실패 시 마지막 정상값 보존 + stale 표시 (C17, C18)
      setState((s) => ({
        ...s,
        status: s.lastKnownGood ? 'stale' : 'error',
        errorCode: mapErrorToCode(msg),
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  /** 실패 fixture를 재생한다. */
  const replayFailure = useCallback(async (fixtureId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fixture = await loadFixture<Fixture>(fixtureId);
      const result = makeFailureState(fixture);
      setFailure(result);
      setState((s) => ({
        ...s,
        status: result.status,
        errorCode: result.errorCode,
        // lastKnownGood 은 건드리지 않는다 (C17: 마지막 정상값이 지워지지 않음)
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  /** 복구 fixture를 재생한다. */
  const replayRecovery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fixture = await loadFixture<RecoveryFixtureShape>(
        RECOVERY_FIXTURE_ID,
      );
      const record = makeRecoveryRecord(fixture);
      setState((s) => {
        // upsert 로 다음 날짜 기록 1건 추가 (C19)
        const merged = upsertDailyRecord(s.records, record);
        return {
          ...s,
          records: merged,
          lastKnownGood: record,
          status: 'fresh',
          errorCode: 'none',
        };
      });
      setFailure(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFailure(null);
    setError(null);
    setState((s) => ({
      ...s,
      status: s.lastKnownGood && isStale(s.lastKnownGood) ? 'stale' : 'fresh',
      errorCode: 'none',
    }));
  }, []);

  const nextAction = useMemo(() => {
    if (!failure) return null;
    return nextActionFor(failure.errorCode);
  }, [failure]);

  return {
    state,
    failure,
    nextAction,
    loading,
    error,
    refreshLive,
    replayFailure,
    replayRecovery,
    reset,
  };
}

function mapErrorToCode(msg: string): ErrorCode {
  const lower = msg.toLowerCase();
  if (lower.includes('401') || lower.includes('403')) return 'auth_rejected';
  if (lower.includes('429')) return 'rate_limited';
  if (lower.includes('offline') || lower.includes('failed to fetch'))
    return 'offline';
  if (lower.includes('schema')) return 'schema_changed';
  if (lower.includes('timeout') || lower.includes('slow')) return 'slow';
  return 'slow';
}