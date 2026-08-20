import { mockSuggestions } from '../data/mockSuggestions';
import type { DraftForm, Suggestion } from '../utils/types';
import type { SuggestionRepository } from './suggestionRepository';

/**
 * Web Storage と同じ最小口。
 * 本番の共通PF API ではなく、Goal B で差し替え可能性を見るための保存口。
 */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * 保存口に JSON 配列を書く Repository。
 * Context / pages はこれを知らず、契約（list / create）だけに依存する。
 */
export class PersistentSuggestionRepository implements SuggestionRepository {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly storageKey: string,
    private readonly seed: Suggestion[] = [],
  ) {}

  async list(): Promise<Suggestion[]> {
    return this.readAll().map((item) => ({ ...item }));
  }

  async create(draft: DraftForm): Promise<Suggestion> {
    const created = toSuggestionFromDraft(draft);
    const next = [created, ...this.readAll()];
    this.writeAll(next);
    return { ...created };
  }

  private readAll(): Suggestion[] {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) {
      const seeded = this.seed.map((item) => ({ ...item }));
      this.writeAll(seeded);
      return seeded;
    }
    try {
      const parsed = JSON.parse(raw) as Suggestion[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // 壊れた保存データでは画面を止めず、空配列として立て直す
      return [];
    }
  }

  private writeAll(items: Suggestion[]): void {
    this.storage.setItem(this.storageKey, JSON.stringify(items));
  }
}

/** Memory 実装と同じ初期値にし、差し替え時の表示差を防ぐ */
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

export const SUGGESTION_STORAGE_KEY = 'digital-suggestion-box:suggestions';

/**
 * Goal B のデフォルト実装。Web Storage は PoC の保存口であり、共通PF API ではない。
 */
export function createPersistentSuggestionRepository(
  storage: KeyValueStorage = localStorage,
  seed: Suggestion[] = mockSuggestions,
): SuggestionRepository {
  return new PersistentSuggestionRepository(
    storage,
    SUGGESTION_STORAGE_KEY,
    seed,
  );
}
