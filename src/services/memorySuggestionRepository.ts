import type { DraftForm, Suggestion } from '../utils/types';
import type { SuggestionRepository } from './suggestionRepository';

/**
 * Goal A 用の Memory 実装。
 * 種データはコピーして持ち、呼び出し側の配列を直接書き換えない。
 */
export class MemorySuggestionRepository implements SuggestionRepository {
  private items: Suggestion[];

  constructor(initial: Suggestion[] = []) {
    this.items = initial.map((item) => ({ ...item }));
  }

  async list(): Promise<Suggestion[]> {
    return this.items.map((item) => ({ ...item }));
  }

  async create(draft: DraftForm): Promise<Suggestion> {
    const created = toSuggestionFromDraft(draft);
    this.items = [created, ...this.items];
    return { ...created };
  }
}

/** Context の addSuggestion と同じ初期値にし、後で配線したときの表示差を防ぐ */
function toSuggestionFromDraft(draft: DraftForm): Suggestion {
  return {
    id: String(Date.now()),
    title: draft.title,
    body: draft.body,
    category: draft.category,
    isAnonymous: draft.isAnonymous,
    authorName: draft.isAnonymous ? undefined : draft.authorName,
    status: '未確認',
    empathyCount: 0,
    hasResponse: false,
    createdAt: new Date().toISOString(),
    isMine: true,
  };
}
