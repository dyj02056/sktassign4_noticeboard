import type { DailyRecord, DayAggregate, RawResponse } from '../types';
import { nowRfc3339Kst, toKstDateKey } from './dateKst';

/**
 * 집계 결과 + 원자료로부터 일별 기록을 생성한다.
 */
export function buildDailyRecord(params: {
  dateKey: string;
  aggregate: DayAggregate;
  raw: RawResponse;
  sourceUrl: string;
}): DailyRecord {
  const { dateKey, aggregate, raw, sourceUrl } = params;

  // 대표 관측 시각: 해당 날짜 스토리 중 가장 최근 created_at
  const observedAt = pickRepresentativeObservedAt(raw);

  return {
    date_kst: dateKey,
    queried_at: nowRfc3339Kst(),
    source_url: sourceUrl,
    source_observed_at: observedAt,
    primary_keyword: aggregate.primaryKeyword,
    primary_count: aggregate.primaryCount,
    top_keywords: aggregate.topKeywords,
    raw,
  };
}

function pickRepresentativeObservedAt(raw: RawResponse): string {
  if (!raw.hits.length) return nowRfc3339Kst();
  let latest = raw.hits[0].created_at;
  for (const h of raw.hits) {
    if (h.created_at > latest) latest = h.created_at;
  }
  return latest;
}

/**
 * public/data/index.json 을 읽어 일별 기록 목록을 가져온다.
 * index.json 은 [{ file: "2026-09-14.json", date_kst: "2026-09-14" }, ...] 형태.
 */
export async function loadDailyRecords(
  signal?: AbortSignal,
): Promise<DailyRecord[]> {
  const base = import.meta.env.BASE_URL ?? '/';
  const indexRes = await fetch(`${base}data/index.json`, { signal });
  if (!indexRes.ok) return [];

  const index = (await indexRes.json()) as Array<{
    file: string;
    date_kst: string;
  }>;

  const records: DailyRecord[] = [];
  for (const entry of index) {
    const res = await fetch(`${base}data/${entry.file}`, { signal });
    if (!res.ok) continue;
    const rec = (await res.json()) as DailyRecord;
    records.push(rec);
  }

  // 날짜 오름차순 정렬
  records.sort((a, b) => a.date_kst.localeCompare(b.date_kst));
  return records;
}

/**
 * 같은 KST 날짜가 이미 있으면 덮어쓰고, 없으면 추가한다.
 * (C20: 같은 날 재실행 → 1건 / C21: 다음 날짜 → 새 건)
 */
export function upsertDailyRecord(
  records: DailyRecord[],
  next: DailyRecord,
): DailyRecord[] {
  const filtered = records.filter((r) => r.date_kst !== next.date_kst);
  const merged = [...filtered, next];
  merged.sort((a, b) => a.date_kst.localeCompare(b.date_kst));
  return merged;
}

/**
 * 어제 대비 변화를 계산한다.
 * records는 날짜 오름차순 정렬되어 있어야 한다.
 * (C24: 두 기록을 날짜순으로 놓고 같은 계산 규칙으로 재계산)
 */
export interface DeltaResult {
  previousDate: string | null;
  currentDate: string;
  previousPrimaryCount: number | null;
  currentPrimaryCount: number;
  delta: number | null;
  primaryKeywordChanged: boolean;
  previousPrimaryKeyword: string | null;
  currentPrimaryKeyword: string;
}

export function computeDelta(records: DailyRecord[]): DeltaResult | null {
  if (records.length === 0) return null;
  const current = records[records.length - 1];
  const previous = records.length >= 2 ? records[records.length - 2] : null;

  return {
    previousDate: previous?.date_kst ?? null,
    currentDate: current.date_kst,
    previousPrimaryCount: previous?.primary_count ?? null,
    currentPrimaryCount: current.primary_count,
    delta:
      previous != null ? current.primary_count - previous.primary_count : null,
    primaryKeywordChanged:
      previous != null && previous.primary_keyword !== current.primary_keyword,
    previousPrimaryKeyword: previous?.primary_keyword ?? null,
    currentPrimaryKeyword: current.primary_keyword,
  };
}

/**
 * 마지막 정상값이 오래된 값인지 판정한다.
 * (C18: 실패 뒤 마지막 정상값에 오래된 값 표시)
 */
export function isStale(record: DailyRecord | null): boolean {
  if (!record) return false;
  return record.date_kst !== toKstDateKey();
}