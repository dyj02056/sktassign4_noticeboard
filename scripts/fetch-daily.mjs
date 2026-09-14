#!/usr/bin/env node
/**
 * HN Algolia에서 특정 KST 날짜의 스토리를 조회·집계해
 * public/data/<날짜>.json 으로 저장하고, public/data/index.json 을 갱신한다.
 *
 * 사용법:
 *   node scripts/fetch-daily.mjs                # 오늘(KST)
 *   node scripts/fetch-daily.mjs 2026-09-14     # 특정 날짜
 *
 * 집계 규칙은 src/lib/aggregate.ts 와 동일하게 유지해야 한다.
 * (C10: 원자료·저장값·화면값 완전 일치)
 */

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'public', 'data');

const HN_ENDPOINT = 'https://hn.algolia.com/api/v1/search_by_date';
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

// ── 계약서(public-contract.json)의 집계 규칙과 동일하게 유지 ──
const STOPWORDS_STANDARD = new Set([
  'the','a','an','and','or','but','of','to','in','on','at','for','with','is',
  'are','was','were','be','been','being','it','its','this','that','these',
  'those','as','by','from','into','about','over','after','before','you','your',
  'we','our','they','their','he','she','his','her','i','my','me','how','what',
  'why','when','where','who','which','will','would','can','could','should',
  'may','might','must','do','does','did','not','no','yes','so','if','then',
  'than','there','here','all','any','some','more','most','other','such','only',
  'own','same','too','very','just','now','also',
]);
const STOPWORDS_HN = new Set([
  'show','ask','hn','hacker','news','new','using','use','used','via','vs',
  'get','got','make','made','one','two','first','last','best','top','good',
  'bad','big','small',
]);
const STOPWORDS = new Set([...STOPWORDS_STANDARD, ...STOPWORDS_HN]);

// ── KST 유틸 ──
function toKstDateKey(date = new Date()) {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function kstDayRange(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const startUtcMs = Date.UTC(y, m - 1, d, 0, 0, 0) - KST_OFFSET_MS;
  const endUtcMs = Date.UTC(y, m - 1, d, 23, 59, 59, 999) - KST_OFFSET_MS;
  return {
    startSec: Math.floor(startUtcMs / 1000),
    endSec: Math.floor(endUtcMs / 1000),
  };
}
function nowRfc3339Kst(date = new Date()) {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  const hh = String(kst.getUTCHours()).padStart(2, '0');
  const mm = String(kst.getUTCMinutes()).padStart(2, '0');
  const ss = String(kst.getUTCSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}+09:00`;
}

// ── 집계 (src/lib/aggregate.ts 와 동일) ──
function aggregateTopKeywords(titles, topN = 5) {
  const counter = new Map();
  for (const title of titles) {
    if (!title) continue;
    const tokens = title.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    for (const token of tokens) {
      if (STOPWORDS.has(token)) continue;
      if (token.length < 2) continue;
      counter.set(token, (counter.get(token) ?? 0) + 1);
    }
  }
  return Array.from(counter.entries())
    .sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])))
    .slice(0, topN)
    .map(([keyword, count]) => ({ keyword, count }));
}

// ── HN 조회 ──
async function fetchStories(dateKey) {
  const { startSec, endSec } = kstDayRange(dateKey);
  const allHits = [];
  let nbHits = 0;
  let page = 0;
  const hitsPerPage = 1000;
  const MAX_PAGES = 20;

  while (page < MAX_PAGES) {
    const params = new URLSearchParams({
      tags: 'story',
      numericFilters: `created_at_i>=${startSec},created_at_i<=${endSec}`,
      hitsPerPage: String(hitsPerPage),
      page: String(page),
    });
    const url = `${HN_ENDPOINT}?${params.toString()}`;
    process.stdout.write(`  page ${page} … `);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HN Algolia ${res.status}`);
    const json = await res.json();
    if (typeof json.nbHits !== 'number' || !Array.isArray(json.hits)) {
      throw new Error('HN Algolia schema mismatch');
    }
    nbHits = json.nbHits;
    allHits.push(...json.hits);
    console.log(`hits=${json.hits.length} (누적 ${allHits.length}/${nbHits})`);

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

// ── 대표 관측 시각 ──
function pickRepresentativeObservedAt(raw) {
  if (!raw.hits.length) return nowRfc3339Kst();
  let latest = raw.hits[0].created_at;
  for (const h of raw.hits) if (h.created_at > latest) latest = h.created_at;
  return latest;
}

// ── 메인 ──
async function main() {
  const dateKey = process.argv[2] ?? toKstDateKey();
  console.log(`\n[fetch-daily] date_kst = ${dateKey}`);

  const raw = await fetchStories(dateKey);
  const titles = raw.hits.map((h) => h.title ?? '').filter(Boolean);
  const topKeywords = aggregateTopKeywords(titles, 5);
  const primary = topKeywords[0] ?? { keyword: '', count: 0 };

  const record = {
    date_kst: dateKey,
    queried_at: nowRfc3339Kst(),
    source_url: HN_ENDPOINT,
    source_observed_at: pickRepresentativeObservedAt(raw),
    primary_keyword: primary.keyword,
    primary_count: primary.count,
    top_keywords: topKeywords,
    raw,
  };

  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });

  const recordPath = join(DATA_DIR, `${dateKey}.json`);
  await writeFile(recordPath, JSON.stringify(record, null, 2) + '\n', 'utf8');
  console.log(`  저장: public/data/${dateKey}.json`);

  // index.json 갱신
  const indexPath = join(DATA_DIR, 'index.json');
  let index = [];
  if (existsSync(indexPath)) {
    try {
      index = JSON.parse(await readFile(indexPath, 'utf8'));
      if (!Array.isArray(index)) index = [];
    } catch {
      index = [];
    }
  }
  const entry = { file: `${dateKey}.json`, date_kst: dateKey };
  index = index.filter((e) => e.date_kst !== dateKey);
  index.push(entry);
  index.sort((a, b) => a.date_kst.localeCompare(b.date_kst));
  await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
  console.log(`  갱신: public/data/index.json (${index.length}건)`);

  console.log(`\n  주 값: ${primary.count}건 (1위 키워드: ${primary.keyword})`);
  console.log(`  Top 5: ${topKeywords.map((k) => `${k.keyword}:${k.count}`).join(', ')}\n`);
}

main().catch((e) => {
  console.error('[fetch-daily] 오류:', e);
  process.exit(1);
});