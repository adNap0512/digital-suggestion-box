import type { Suggestion, SummaryStats } from './types';

/** 投稿数・対応済み・検討中の集計 */
export function getSummaryStats(suggestions: Suggestion[]): SummaryStats {
  return {
    total: suggestions.length,
    resolved: suggestions.filter((s) => s.status === '対応済み').length,
    reviewing: suggestions.filter((s) => s.status === '検討中').length,
  };
}
