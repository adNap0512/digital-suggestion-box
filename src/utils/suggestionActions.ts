import type { Suggestion, Status } from './types';

/** 共感数を1増やす（イミュータブル） */
export function incrementEmpathy(suggestion: Suggestion): Suggestion {
  return { ...suggestion, empathyCount: suggestion.empathyCount + 1 };
}

/** ステータスを更新する */
export function updateStatus(suggestion: Suggestion, status: Status): Suggestion {
  return { ...suggestion, status };
}

/** 管理者回答を追加する */
export function addResponse(suggestion: Suggestion, response: string): Suggestion {
  return {
    ...suggestion,
    response,
    hasResponse: response.trim().length > 0,
  };
}

/** ID で投稿を更新する */
export function updateSuggestionById(
  suggestions: Suggestion[],
  id: string,
  updater: (s: Suggestion) => Suggestion,
): Suggestion[] {
  return suggestions.map((s) => (s.id === id ? updater(s) : s));
}
