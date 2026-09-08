import { describe, expect, it } from 'vitest';
import {
  SupabaseSuggestionRepository,
  type SuggestionInsert,
  type SuggestionRow,
  type SuggestionsRemoteClient,
} from '../../services/supabaseSuggestionRepository';
import type { SuggestionRepository } from '../../services/suggestionRepository';
import type { DraftForm } from '../../utils/types';

const sampleDraft: DraftForm = {
  category: '業務改善',
  isAnonymous: true,
  authorName: '',
  title: 'Supabase 契約テスト用の投稿',
  body: 'list / create の境界を実 Key なしで確認する',
};

const sampleRow: SuggestionRow = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  title: '既存の投稿',
  body: 'DB 行から Suggestion へ写す',
  category: '職場環境',
  is_anonymous: false,
  author_name: '佐藤',
  created_at: '2026-09-01T00:00:00.000Z',
};

/** 実 SDK / ネットワークを使わない注入用クライアント */
class FakeSuggestionsRemoteClient implements SuggestionsRemoteClient {
  rows: SuggestionRow[] = [];
  listError: { message: string } | null = null;
  insertError: { message: string } | null = null;
  lastInsert: SuggestionInsert | null = null;

  async listRows() {
    if (this.listError) {
      return { data: null, error: this.listError };
    }
    return { data: this.rows.map((row) => ({ ...row })), error: null };
  }

  async insertRow(input: SuggestionInsert) {
    this.lastInsert = { ...input };
    if (this.insertError) {
      return { data: null, error: this.insertError };
    }
    const row: SuggestionRow = {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      title: input.title,
      body: input.body,
      category: input.category,
      is_anonymous: input.is_anonymous,
      author_name: input.author_name,
      created_at: '2026-09-08T12:00:00.000Z',
    };
    this.rows = [row, ...this.rows];
    return { data: { ...row }, error: null };
  }
}

function createRepository(client: SuggestionsRemoteClient): SuggestionRepository {
  return new SupabaseSuggestionRepository(client);
}

describe('SuggestionRepository（Supabase / 注入クライアント）', () => {
  it('list は DB 行を Suggestion へ変換し、Goal C 対象外の値を補完する', async () => {
    const client = new FakeSuggestionsRemoteClient();
    client.rows = [sampleRow];
    const repository = createRepository(client);

    const listed = await repository.list();

    expect(listed).toHaveLength(1);
    expect(listed[0]).toEqual({
      id: sampleRow.id,
      title: sampleRow.title,
      body: sampleRow.body,
      category: '職場環境',
      isAnonymous: false,
      authorName: '佐藤',
      status: '未確認',
      empathyCount: 0,
      hasResponse: false,
      createdAt: sampleRow.created_at,
      isMine: false,
    });
  });

  it('list の匿名行は authorName を持たない', async () => {
    const client = new FakeSuggestionsRemoteClient();
    client.rows = [
      {
        ...sampleRow,
        is_anonymous: true,
        author_name: null,
      },
    ];
    const listed = await createRepository(client).list();

    expect(listed[0].isAnonymous).toBe(true);
    expect(listed[0].authorName).toBeUndefined();
  });

  it('create は DraftForm を INSERT 形式へ変換し、返却行を Suggestion にする', async () => {
    const client = new FakeSuggestionsRemoteClient();
    const created = await createRepository(client).create(sampleDraft);

    expect(client.lastInsert).toEqual({
      title: sampleDraft.title,
      body: sampleDraft.body,
      category: sampleDraft.category,
      is_anonymous: true,
      author_name: null,
    });
    expect(created.title).toBe(sampleDraft.title);
    expect(created.body).toBe(sampleDraft.body);
    expect(created.category).toBe(sampleDraft.category);
    expect(created.isAnonymous).toBe(true);
    expect(created.authorName).toBeUndefined();
    expect(created.status).toBe('未確認');
    expect(created.empathyCount).toBe(0);
    expect(created.hasResponse).toBe(false);
    expect(created.isMine).toBe(true);
    expect(created.id).toBe('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
    expect(created.createdAt).toBe('2026-09-08T12:00:00.000Z');
  });

  it('記名投稿の create は author_name を送る', async () => {
    const client = new FakeSuggestionsRemoteClient();
    const created = await createRepository(client).create({
      ...sampleDraft,
      isAnonymous: false,
      authorName: '山田',
    });

    expect(client.lastInsert?.is_anonymous).toBe(false);
    expect(client.lastInsert?.author_name).toBe('山田');
    expect(created.isAnonymous).toBe(false);
    expect(created.authorName).toBe('山田');
  });

  it('create した投稿が同じクライアントの list に含まれる', async () => {
    const client = new FakeSuggestionsRemoteClient();
    const repository = createRepository(client);
    const created = await repository.create(sampleDraft);
    const listed = await repository.list();

    expect(listed.some((s) => s.id === created.id)).toBe(true);
    expect(listed.some((s) => s.title === sampleDraft.title)).toBe(true);
  });

  it('list でクライアントがエラーを返したら成功扱いにしない', async () => {
    const client = new FakeSuggestionsRemoteClient();
    client.listError = { message: 'permission denied for table suggestions' };

    await expect(createRepository(client).list()).rejects.toThrow(
      'permission denied for table suggestions',
    );
  });

  it('create でクライアントがエラーを返したら成功扱いにしない', async () => {
    const client = new FakeSuggestionsRemoteClient();
    client.insertError = { message: 'new row violates row-level security' };

    await expect(createRepository(client).create(sampleDraft)).rejects.toThrow(
      'new row violates row-level security',
    );
  });
});
