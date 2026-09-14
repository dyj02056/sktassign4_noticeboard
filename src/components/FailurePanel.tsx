import { FAILURE_FIXTURES } from '../lib/fixtures';

interface Props {
  onReplay: (fixtureId: string) => void;
  loading: boolean;
  activeFixtureId: string | null;
}

export function FailurePanel({ onReplay, loading, activeFixtureId }: Props) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 dark:bg-zinc-900 p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        실패 재생 (합성 시험값)
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        아래 버튼은 실제 네트워크를 건드리지 않고, 합성 fixture로 실패 상태를
        재현합니다.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {FAILURE_FIXTURES.map((f) => {
          const active = activeFixtureId === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onReplay(f.id)}
              disabled={loading}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 ${
                active
                  ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200'
                  : 'border-zinc-200 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="font-medium">{f.label}</div>
              <div className="mt-0.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-500">
                {f.id}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}