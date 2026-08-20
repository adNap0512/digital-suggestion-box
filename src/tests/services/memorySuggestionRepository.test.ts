import { describe, expect, it } from 'vitest';
import { mockSuggestions } from '../../data/mockSuggestions';
import { MemorySuggestionRepository } from '../../services/memorySuggestionRepository';
import type { SuggestionRepository } from '../../services/suggestionRepository';
import type { DraftForm } from '../../utils/types';

const sampleDraft: DraftForm = {
  category: '業務改善',
  isAnonymous: true,
  authorName: '',
  title: '契約テスト用の投稿',
  body: 'list / create の境界を確認するための本文',
};

function createRepository(initial = mockSuggestions): SuggestionRepository {
  return new MemorySuggestionRepository(initial);
}

describe('SuggestionRepository（Memory）', () => {
  it('list で初期データを取得できる', async () => {
    const repository = createRepository();
    const listed = await repository.list();
    expect(listed).toHaveLength(mockSuggestions.length);
    expect(listed.map((s) => s.id)).toEqual(mockSuggestions.map((s) => s.id));
  });

  it('create した投稿が同じインスタンスの list に含まれる', async () => {
    const repository = createRepository();
    const created = await repository.create(sampleDraft);
    const listed = await repository.list();

    expect(listed[0]).toEqual(created);
    expect(listed).toHaveLength(mockSuggestions.length + 1);
    expect(listed.some((s) => s.title === sampleDraft.title)).toBe(true);
  });

  it('create は DraftForm を Suggestion の初期値へ変換する', async () => {
    const repository = createRepository([]);
    const created = await repository.create(sampleDraft);

    expect(created.title).toBe(sampleDraft.title);
    expect(created.body).toBe(sampleDraft.body);
    expect(created.category).toBe(sampleDraft.category);
    expect(created.isAnonymous).toBe(true);
    expect(created.authorName).toBeUndefined();
    expect(created.status).toBe('未確認');
    expect(created.empathyCount).toBe(0);
    expect(created.hasResponse).toBe(false);
    expect(created.isMine).toBe(true);
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();
  });

  it('記名投稿では authorName を保持する', async () => {
    const repository = createRepository([]);
    const created = await repository.create({
      ...sampleDraft,
      isAnonymous: false,
      authorName: '山田',
    });

    expect(created.isAnonymous).toBe(false);
    expect(created.authorName).toBe('山田');
  });

  it('list の戻り値を変更しても Repository 内部は変わらない', async () => {
    const repository = createRepository();
    const listed = await repository.list();
    listed.pop();

    const listedAgain = await repository.list();
    expect(listedAgain).toHaveLength(mockSuggestions.length);
  });
});
