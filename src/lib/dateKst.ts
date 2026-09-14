// KST(Asia/Seoul) 기준 유틸리티

const KST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9

/**
 * 주어진 시각을 KST 기준 "YYYY-MM-DD" 문자열로 반환한다.
 */
export function toKstDateKey(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * KST 기준 특정 날짜의 시작(00:00:00)과 끝(23:59:59.999)을
 * Unix timestamp(초)로 반환한다.
 */
export function kstDayRange(dateKey: string): { startSec: number; endSec: number } {
  // dateKey는 "YYYY-MM-DD"
  const [y, m, d] = dateKey.split('-').map(Number);
  // KST 00:00 = UTC 전날 15:00
  const startUtcMs = Date.UTC(y, m - 1, d, 0, 0, 0) - KST_OFFSET_MS;
  const endUtcMs = Date.UTC(y, m - 1, d, 23, 59, 59, 999) - KST_OFFSET_MS;
  return {
    startSec: Math.floor(startUtcMs / 1000),
    endSec: Math.floor(endUtcMs / 1000),
  };
}

/**
 * 현재 시각을 RFC 3339 (KST 오프셋 포함) 문자열로 반환한다.
 * 예: "2026-09-14T01:23:45+09:00"
 */
export function nowRfc3339Kst(date: Date = new Date()): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  const hh = String(kst.getUTCHours()).padStart(2, '0');
  const mm = String(kst.getUTCMinutes()).padStart(2, '0');
  const ss = String(kst.getUTCSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}+09:00`;
}