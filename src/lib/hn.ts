import type { RawResponse, RawHit } from '../types';
import { aggregateTopKeywords } from './aggregate';
import { kstDayRange } from './dateKst';
import type { DayAggregate } from '../types';

export const HN_ALGOLIA_ENDPOINT =
  'https://hn.algolia.com/api/v1/search_by_date';

/**
 * 특정 KST 날짜 하루 동안 생성된 HN 스토리를 가져온다.
 * 페이지네이션으로 모든 hits를 수집한다.
 */
export async function fetchStoriesForKstDay(
  dateKey: string,
  signal?: AbortSignal,
): Promise<RawResponse> {
  const { startSec, endSec } = kstDayRange(dateKey);

  const allHits: RawHit[] = [];
  let nbHits = 0;
  let page = 0;
  const hitsPerPage = 1000; // Algolia 최대
  const MAX_PAGES = 20; // 안전 상한

  while (page < MAX_PAGES) {
    const params = new URLSearchParams({
      tags: 'story',
      numericFilters: `created_at_i>=${startSec},created_at_i<=${endSec}`,
      hitsPerPage: String(hitsPerPage),
      page: String(page),
    });

    const res = await fetch(`${HN_ALGOLIA_ENDPOINT}?${params.toString()}`, {
      signal,
    });

    if (!res.ok) {
      throw new HttpError(res.status, `HN Algolia returned ${res.status}`);
    }

    const json = (await res.json()) as RawResponse;

    // 스키마 검증 (C16)
    if (typeof json.nbHits !== 'number' || !Array.isArray(json.hits)) {
      throw new SchemaError('HN Algolia response schema mismatch');
    }

    nbHits = json.nbHits;
    allHits.push(...json.hits);

    if (json.hits.length < hitsPerPage) break;
    if (allHits.length >= nbHits) break;
    page += 1;
  }

  return {
    hits: allHits,
    nbHits,
    page: 0,
    nbPages: Math.ceil(nbHits / hitsPerPage),
    hitsPerPage,
    query: '',
  };
}

/**
 * KST 날짜 하루치를 집계해 DayAggregate로 반환한다.
 */
export function aggregateDay(raw: RawResponse): DayAggregate {
  const titles = raw.hits.map((h) => h.title ?? '').filter(Boolean);
  const topKeywords = aggregateTopKeywords(titles, 5);

  const first = topKeywords[0];
  return {
    primaryKeyword: first?.keyword ?? '',
    primaryCount: first?.count ?? 0,
    topKeywords,
  };
}

// 커스텀 에러
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class SchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaError';
  }
}