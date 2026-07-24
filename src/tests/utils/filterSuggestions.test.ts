import { describe, expect, it } from 'vitest';
import { mockSuggestions } from '../../data/mockSuggestions';
import {
  filterSuggestions,
  getRecentSuggestions,
} from '../../utils/filterSuggestions';

describe('filterSuggestions', () => {
  it('カテゴリでフィルタできる', () => {
    const result = filterSuggestions(mockSuggestions, {
      category: '職場環境',
    });
    expect(result.every((s) => s.category === '職場環境')).toBe(true);
  });

  it('ステータスでフィルタできる', () => {
    const result = filterSuggestions(mockSuggestions, { status: '対応済み' });
    expect(result.every((s) => s.status === '対応済み')).toBe(true);
  });

  it('自分の投稿のみフィルタできる', () => {
    const result = filterSuggestions(mockSuggestions, { mineOnly: true });
    expect(result.every((s) => s.isMine)).toBe(true);
  });

  it('すべての場合は全件返す', () => {
    const result = filterSuggestions(mockSuggestions, {
      category: 'すべて',
      status: 'すべて',
    });
    expect(result.length).toBe(mockSuggestions.length);
  });
});

describe('getRecentSuggestions', () => {
  it('最新N件を返す', () => {
    const result = getRecentSuggestions(mockSuggestions, 3);
    expect(result.length).toBe(3);
  });
});
