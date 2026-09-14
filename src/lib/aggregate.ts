import type { KeywordCount } from '../types';

// 계약서(public-contract.json) aggregation_rules.stopwords_standard
const STOPWORDS_STANDARD = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for',
  'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'it', 'its',
  'this', 'that', 'these', 'those', 'as', 'by', 'from', 'into', 'about',
  'over', 'after', 'before', 'you', 'your', 'we', 'our', 'they', 'their',
  'he', 'she', 'his', 'her', 'i', 'my', 'me', 'how', 'what', 'why', 'when',
  'where', 'who', 'which', 'will', 'would', 'can', 'could', 'should', 'may',
  'might', 'must', 'do', 'does', 'did', 'not', 'no', 'yes', 'so', 'if',
  'then', 'than', 'there', 'here', 'all', 'any', 'some', 'more', 'most',
  'other', 'such', 'only', 'own', 'same', 'too', 'very', 'just', 'now', 'also',
]);

// 계약서 aggregation_rules.stopwords_hn_specific
const STOPWORDS_HN = new Set([
  'show', 'ask', 'hn', 'hacker', 'news', 'new', 'using', 'use', 'used',
  'via', 'vs', 'get', 'got', 'make', 'made', 'one', 'two', 'first', 'last',
  'best', 'top', 'good', 'bad', 'big', 'small',
]);

const STOPWORDS = new Set([...STOPWORDS_STANDARD, ...STOPWORDS_HN]);

/**
 * 제목 배열을 계약서 규칙에 따라 Top N 키워드로 집계한다.
 */
export function aggregateTopKeywords(
  titles: string[],
  topN = 5,
): KeywordCount[] {
  const counter = new Map<string, number>();

  for (const title of titles) {
    if (!title) continue;

    // 1. lowercase
    // 2. tokenize (영숫자 외 문자를 구분자로)
    const tokens = title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean);

    for (const token of tokens) {
      // 3. remove stopwords
      if (STOPWORDS.has(token)) continue;
      // 4. min_length (2 미만 제거)
      if (token.length < 2) continue;

      counter.set(token, (counter.get(token) ?? 0) + 1);
    }
  }

  // 5. count (이미 위에서 셈)
  // 6. sort: 횟수 내림차순, 동률이면 사전순 오름차순
  const sorted = Array.from(counter.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  // 7. top_n
  return sorted.slice(0, topN).map(([keyword, count]) => ({ keyword, count }));
}