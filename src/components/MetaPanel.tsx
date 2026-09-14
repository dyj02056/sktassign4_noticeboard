import type { DailyRecord } from '../types';

interface Props {
  record: DailyRecord | null;
}

const REFERENCE_TZ = 'Asia/Seoul (KST)';

export function MetaPanel({ record }: Props) {
  if (!record) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          출처·시각
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
        출처·시각
      </h2>
      <dl className="mt-3 space-y-2 text-sm">
        <Row label="출처">
          <a
            href={record.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
          >
            {record.source_url}
          </a>
        </Row>
        <Row label="출처 시각">
          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {record.source_observed_at}
          </span>
        </Row>
        <Row label="조회 시각">
          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {record.queried_at}
          </span>
        </Row>
        <Row label="기준 시간대">
          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {REFERENCE_TZ}
          </span>
        </Row>
        <Row label="날짜 키 (KST)">
          <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {record.date_kst}
          </span>
        </Row>
      </dl>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="w-28 shrink-0 text-xs text-zinc-500 dark:text-zinc-500">
        {label}
      </dt>
      <dd className="min-w-0 break-all">{children}</dd>
    </div>
  );
}