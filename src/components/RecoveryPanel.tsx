interface Props {
  onReplay: () => void;
  loading: boolean;
  status: string;
  errorCode: string;
  nextAction: string | null;
  onReset: () => void;
}

export function RecoveryPanel({
  onReplay,
  loading,
  status,
  errorCode,
  nextAction,
  onReset,
}: Props) {
  const showNextAction = status === 'error' || status === 'stale';

  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        복구 재생
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        복구 fixture를 재생하면 상태가 fresh로 돌아오고, 다음 날짜의 일별
        기록이 1건 추가됩니다.
      </p>

      {showNextAction && nextAction && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <div className="font-medium">다음 행동</div>
          <p className="mt-1 text-xs">{nextAction}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onReplay}
          disabled={loading}
          className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900"
        >
          복구 재생 (T04-RECOVER-D2)
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="rounded-md border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          상태 초기화
        </button>
      </div>

      <p className="mt-3 font-mono text-[10px] text-zinc-500 dark:text-zinc-500">
        현재 상태: {status} / error_code: {errorCode}
      </p>
    </section>
  );
}