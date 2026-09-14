import type { DailyRecord } from '../types';

interface Props {
  record: DailyRecord | null;
}

export function ValuePanel({ record }: Props) {
  if (!record) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          값
        </h2>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-600">
          아직 기록이 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        값 (주 값 + Top 5)
      </h2>

      {/* 주 값 */}
      <div className="mt-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-4xl font-semibold text-zinc-900 dark:text-zinc-50">
            {record.primary_count}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">건</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          오늘 1위 키워드:{' '}
          <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
            {record.primary_keyword}
          </span>
        </p>
      </div>

      {/* Top 5 */}
      <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Top 5 키워드
        </h3>
        <ul className="mt-2 space-y-1.5">
          {record.top_keywords.map((kw, i) => (
            <li
              key={kw.keyword}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="w-4 font-mono text-xs text-zinc-400 dark:text-zinc-600">
                  {i + 1}
                </span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {kw.keyword}
                </span>
              </span>
              <span className="font-mono text-zinc-900 dark:text-zinc-100">
                {kw.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}