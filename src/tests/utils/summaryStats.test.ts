import { describe, expect, it } from 'vitest';
import { mockSuggestions } from '../../data/mockSuggestions';
import { getSummaryStats } from '../../utils/summaryStats';

describe('getSummaryStats', () => {
  it('投稿数・対応済み・検討中を集計する', () => {
    const stats = getSummaryStats(mockSuggestions);
    expect(stats.total).toBe(mockSuggestions.length);
    expect(stats.resolved).toBe(
      mockSuggestions.filter((s) => s.status === '対応済み').length,
    );
    expect(stats.reviewing).toBe(
      mockSuggestions.filter((s) => s.status === '検討中').length,
    );
  });
});
