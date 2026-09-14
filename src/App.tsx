import { useMemo, useState } from 'react';
import { useBoard } from './lib/boardState';
import { computeDelta } from './lib/dailyRecord';
import { StatusBadge } from './components/StatusBadge';
import { ValuePanel } from './components/ValuePanel';
import { MetaPanel } from './components/MetaPanel';
import { DeltaPanel } from './components/DeltaPanel';
import { FailurePanel } from './components/FailurePanel';
import { RecoveryPanel } from './components/RecoveryPanel';
import { ReconcileView } from './components/ReconcileView';

function App() {
  const {
    state,
    failure,
    nextAction,
    loading,
    error,
    refreshLive,
    replayFailure,
    replayRecovery,
    reset,
  } = useBoard();

  const [activeFixtureId, setActiveFixtureId] = useState<string | null>(null);

  const delta = useMemo(() => computeDelta(state.records), [state.records]);

  const handleReplayFailure = (fixtureId: string) => {
    setActiveFixtureId(fixtureId);
    void replayFailure(fixtureId);
  };

  const handleRecovery = () => {
    setActiveFixtureId(null);
    void replayRecovery();
  };

  const handleReset = () => {
    setActiveFixtureId(null);
    reset();
  };

  const lastRecord = state.lastKnownGood;

  return (
    <div className="min-h-[100dvh] bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              오늘의 진짜 정보판
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Hacker News 키워드 트렌드 · 기준 시간대 Asia/Seoul (KST)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={state.status} errorCode={state.errorCode} />
            <button
              type="button"
              onClick={() => void refreshLive()}
              disabled={loading}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {loading ? '조회 중…' : '지금 조회'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
            {error}
          </div>
        )}

        {failure && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
            <div className="font-medium">
              실패 재생 중: {failure.label}{' '}
              <span className="font-mono text-xs opacity-70">
                ({failure.errorCode})
              </span>
            </div>
            <p className="mt-1 text-xs">{failure.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ValuePanel record={lastRecord} />
          <div className="space-y-6">
            <MetaPanel record={lastRecord} />
            <DeltaPanel delta={delta} />
          </div>
        </div>

        <ReconcileView record={lastRecord} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <FailurePanel
            onReplay={handleReplayFailure}
            loading={loading}
            activeFixtureId={activeFixtureId}
          />
          <RecoveryPanel
            onReplay={handleRecovery}
            loading={loading}
            status={state.status}
            errorCode={state.errorCode}
            nextAction={nextAction}
            onReset={handleReset}
          />
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            일별 기록 ({state.records.length}건)
          </h2>
          {state.records.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-600">
              아직 저장된 기록이 없습니다. "지금 조회"를 누르거나 배포된
              data/index.json 을 확인하세요.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
              {state.records.map((r) => (
                <li
                  key={r.date_kst}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-2 text-sm"
                >
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {r.date_kst}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    1위{' '}
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      {r.primary_keyword}
                    </span>{' '}
                    · {r.primary_count}건
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="pt-2 pb-8 text-center text-xs text-zinc-400 dark:text-zinc-600">
          원천: Hacker News (Algolia Search API) · 비밀키 불필요 · 합성
          fixture는 실패 재생에만 사용
        </footer>
      </main>
    </div>
  );
}

export default App;