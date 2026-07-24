import type { FilterOptions, Suggestion } from './types';

/** カテゴリ・ステータス・自分の投稿でフィルタする */
export function filterSuggestions(
  suggestions: Suggestion[],
  options: FilterOptions,
): Suggestion[] {
  return suggestions.filter((s) => {
    if (options.mineOnly && !s.isMine) return false;
    if (options.category && options.category !== 'すべて' && s.category !== options.category) {
      return false;
    }
    if (options.status && options.status !== 'すべて' && s.status !== options.status) {
      return false;
    }
    return true;
  });
}

/** 最近の投稿を取得（日付降順） */
export function getRecentSuggestions(
  suggestions: Suggestion[],
  count: number,
): Suggestion[] {
  return [...suggestions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count);
}
