import { useState } from 'react';
import type { DailyRecord } from '../types';

interface Props {
  record: DailyRecord | null;
}

type Tab = 'raw' | 'stored' | 'rendered';

export function ReconcileView({ record }: Props) {
  const [tab, setTab] = useState<Tab>('stored');

  if (!record) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          원자료·저장값·화면값 대조
        </h2>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-600">
          기록이 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        원자료·저장값·화면값 대조
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        C10 검증용. 같은 값이 세 관점에서 일치하는지 확인합니다.
      </p>

      <div className="mt-4 flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        <TabButton active={tab === 'raw'} onClick={() => setTab('raw')}>
          원자료
        </TabButton>
        <TabButton active={tab === 'stored'} onClick={() => setTab('stored')}>
          저장값
        </TabButton>
        <TabButton active={tab === 'rendered'} onClick={() => setTab('rendered')}>
          화면값
        </TabButton>
      </div>

      <div className="mt-4">
        {tab === 'raw' && (
          <div>
            <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
              HN Algolia 원응답 스냅샷 (hits 수:{' '}
              <span className="font-mono">{record.raw.hits.length}</span>,
              nbHits:{' '}
              <span className="font-mono">{record.raw.nbHits}</span>)
            </p>
            <pre className="max-h-96 overflow-auto rounded-md bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
              {JSON.stringify(
                {
                  nbHits: record.raw.nbHits,
                  page: record.raw.page,
                  nbPages: record.raw.nbPages,
                  hitsPerPage: record.raw.hitsPerPage,
                  hits_sample: record.raw.hits.slice(0, 5).map((h) => ({
                    objectID: h.objectID,
                    title: h.title,
                    created_at: h.created_at,
                    points: h.points,
                  })),
                },
                null,
                2,
              )}
            </pre>
          </div>
        )}

        {tab === 'stored' && (
          <pre className="max-h-96 overflow-auto rounded-md bg-zinc-50 p-3 font-mono text-[11px] leading-relaxed text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
            {JSON.stringify(
              {
                date_kst: record.date_kst,
                queried_at: record.queried_at,
                source_url: record.source_url,
                source_observed_at: record.source_observed_at,
                primary_keyword: record.primary_keyword,
                primary_count: record.primary_count,
                top_keywords: record.top_keywords,
              },
              null,
              2,
            )}
          </pre>
        )}

        {tab === 'rendered' && (
          <div className="space-y-2 text-sm">
            <Row label="날짜 (KST)" value={record.date_kst} mono />
            <Row label="주 값" value={`${record.primary_count} 건`} mono />
            <Row label="1위 키워드" value={record.primary_keyword} mono />
            <Row
              label="Top 5"
              value={record.top_keywords
                .map((k) => `${k.keyword}:${k.count}`)
                .join(', ')}
              mono
            />
            <Row label="출처 시각" value={record.source_observed_at} mono />
            <Row label="조회 시각" value={record.queried_at} mono />
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        세 탭의{' '}
        <span className="font-mono">primary_count</span> 와{' '}
        <span className="font-mono">top_keywords</span> 가 모두 일치하면 C10
        충족입니다.
      </p>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
        active
          ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
          : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="w-28 shrink-0 text-xs text-zinc-500 dark:text-zinc-500">
        {label}
      </span>
      <span
        className={`min-w-0 break-all text-zinc-700 dark:text-zinc-300 ${
          mono ? 'font-mono text-xs' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}