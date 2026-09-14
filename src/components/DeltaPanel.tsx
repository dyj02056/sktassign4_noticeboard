import type { DeltaResult } from '../lib/dailyRecord';

interface Props {
  delta: DeltaResult | null;
}

export function DeltaPanel({ delta }: Props) {
  if (!delta) {
    return (
      <section className="rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          어제 대비 변화
        </h2>
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-600">
          비교할 기록이 부족합니다.
        </p>
      </section>
    );
  }

  const { delta: diff, previousPrimaryCount, currentPrimaryCount } = delta;
  const isUp = diff != null && diff > 0;
  const isDown = diff != null && diff < 0;

  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        어제 대비 변화
      </h2>

      {diff == null ? (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          첫 기록입니다. 다음 날짜 기록이 생기면 비교가 표시됩니다.
        </p>
      ) : (
        <div className="mt-3">
          <div className="flex items-baseline gap-3">
            <span
              className={`font-mono text-3xl font-semibold ${
                isUp
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isDown
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {diff > 0 ? '+' : ''}
              {diff}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">건</span>
          </div>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {delta.previousDate} ({previousPrimaryCount}건,{' '}
            <span className="font-mono">{delta.previousPrimaryKeyword}</span>) →{' '}
            {delta.currentDate} ({currentPrimaryCount}건,{' '}
            <span className="font-mono">{delta.currentPrimaryKeyword}</span>)
          </p>

          {delta.primaryKeywordChanged && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              1위 키워드가 바뀌었습니다.
            </p>
          )}
        </div>
      )}
    </section>
  );
}