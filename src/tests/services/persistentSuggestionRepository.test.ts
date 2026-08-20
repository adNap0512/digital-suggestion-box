import { describe, expect, it } from 'vitest';
import { mockSuggestions } from '../../data/mockSuggestions';
import {
  PersistentSuggestionRepository,
  type KeyValueStorage,
} from '../../services/persistentSuggestionRepository';
import type { SuggestionRepository } from '../../services/suggestionRepository';
import type { DraftForm } from '../../utils/types';

const STORAGE_KEY = 'digital-suggestion-box:suggestions';

const sampleDraft: DraftForm = {
  category: '業務改善',
  isAnonymous: true,
  authorName: '',
  title: '永続化契約テスト用の投稿',
  body: '同じ保存口ならインスタンス再生成後も list できることを確認する',
};

/** テスト用の保存口。Web Storage と同じ getItem / setItem だけを持つ */
class MemoryKeyValueStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.has(key) ? this.values.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function createRepository(
  storage: KeyValueStorage,
  seed = mockSuggestions,
): SuggestionRepository {
  return new PersistentSuggestionRepository(storage, STORAGE_KEY, seed);
}

describe('SuggestionRepository（Persistent / 保存口）', () => {
  it('保存口が空なら種データを list できる', async () => {
    const repository = createRepository(new MemoryKeyValueStorage());
    const listed = await repository.list();
    expect(listed).toHaveLength(mockSuggestions.length);
    expect(listed.map((s) => s.id)).toEqual(mockSuggestions.map((s) => s.id));
  });

  it('create した投稿が同じインスタンスの list に含まれる', async () => {
    const repository = createRepository(new MemoryKeyValueStorage());
    const created = await repository.create(sampleDraft);
    const listed = await repository.list();

    expect(listed[0]).toEqual(created);
    expect(listed).toHaveLength(mockSuggestions.length + 1);
  });

  it('create した投稿を、同じ保存口で再生成したインスタンスから list できる', async () => {
    const storage = new MemoryKeyValueStorage();
    const first = createRepository(storage);
    const created = await first.create(sampleDraft);

    const second = createRepository(storage);
    const listed = await second.list();

    expect(listed.some((s) => s.id === created.id)).toBe(true);
    expect(listed.some((s) => s.title === sampleDraft.title)).toBe(true);
  });

  it('別の保存口で再生成したインスタンスからは見えない', async () => {
    const first = createRepository(new MemoryKeyValueStorage(), []);
    await first.create(sampleDraft);

    const second = createRepository(new MemoryKeyValueStorage(), []);
    const listed = await second.list();

    expect(listed.some((s) => s.title === sampleDraft.title)).toBe(false);
  });
});
