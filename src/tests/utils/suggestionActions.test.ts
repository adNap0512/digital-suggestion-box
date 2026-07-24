import { describe, expect, it } from 'vitest';
import { mockSuggestions } from '../../data/mockSuggestions';
import {
  addResponse,
  incrementEmpathy,
  updateStatus,
} from '../../utils/suggestionActions';

describe('suggestionActions', () => {
  const sample = mockSuggestions[0];

  it('共感数を1増やす', () => {
    const result = incrementEmpathy(sample);
    expect(result.empathyCount).toBe(sample.empathyCount + 1);
    expect(sample.empathyCount).toBe(mockSuggestions[0].empathyCount);
  });

  it('ステータスを更新する', () => {
    const result = updateStatus(sample, '対応済み');
    expect(result.status).toBe('対応済み');
  });

  it('回答を追加する', () => {
    const result = addResponse(sample, 'ありがとうございます');
    expect(result.hasResponse).toBe(true);
    expect(result.response).toBe('ありがとうございます');
  });
});
