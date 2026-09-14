import type { Status } from '../types';

interface Props {
  status: Status;
  errorCode: string;
}

const LABELS: Record<Status, string> = {
  fresh: '정상',
  stale: '오래된 값',
  error: '오류',
};

const STYLES: Record<Status, string> = {
  fresh:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
  stale:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900',
  error:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900',
};

export function StatusBadge({ status, errorCode }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {LABELS[status]}
      {status !== 'fresh' && errorCode !== 'none' && (
        <span className="font-mono text-[10px] opacity-70">
          {errorCode}
        </span>
      )}
    </span>
  );
}