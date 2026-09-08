import { describe, expect, it } from 'vitest';
import {
  SUGGESTION_COLUMNS,
  SupabaseSuggestionsRemoteClient,
  tryCreateSupabaseSuggestionsRemoteClientFromEnv,
  type SuggestionsSupabaseClient,
} from '../../services/supabaseSuggestionsRemoteClient';
import type { SuggestionInsert, SuggestionRow } from '../../services/supabaseSuggestionRepository';

const sampleRow: SuggestionRow = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  title: '既存の投稿',
  body: 'SELECT の戻りを RemoteClient 行として返す',
  category: '職場環境',
  is_anonymous: false,
  author_name: '佐藤',
  created_at: '2026-09-01T00:00:00.000Z',
};

const sampleInsert: SuggestionInsert = {
  title: '新規投稿',
  body: 'INSERT payload を確認する',
  category: '業務改善',
  is_anonymous: true,
  author_name: null,
};

/**
 * SDK の from().select().order / insert().select().single の戻りだけを満たす。
 * fetch は持たないので、このテストではネットワーク通信しない。
 */
function createFakeSdkClient(options: {
  listResult: { data: SuggestionRow[] | null; error: { message: string } | null };
  insertResult: { data: SuggestionRow | null; error: { message: string } | null };
}): {
  client: SuggestionsSupabaseClient;
  calls: {
    table: string | null;
    selectColumns: string | null;
    order: { column: string; ascending: boolean } | null;
    insertPayload: SuggestionInsert | null;
    insertSelectColumns: string | null;
  };
} {
  const calls = {
    table: null as string | null,
    selectColumns: null as string | null,
    order: null as { column: string; ascending: boolean } | null,
    insertPayload: null as SuggestionInsert | null,
    insertSelectColumns: null as string | null,
  };

  const client: SuggestionsSupabaseClient = {
    from(table: string) {
      calls.table = table;
      return {
        select(columns: string) {
          calls.selectColumns = columns;
          return {
            order(column: string, orderOptions: { ascending: boolean }) {
              calls.order = { column, ascending: orderOptions.ascending };
              return Promise.resolve(options.listResult);
            },
          };
        },
        insert(values: SuggestionInsert) {
          calls.insertPayload = { ...values };
          return {
            select(columns: string) {
              calls.insertSelectColumns = columns;
              return {
                single() {
                  return Promise.resolve(options.insertResult);
                },
              };
            },
          };
        },
      };
    },
  };

  return { client, calls };
}

describe('SupabaseSuggestionsRemoteClient', () => {
  it('SELECT は suggestions の Goal C 列だけを取り、行として返す', async () => {
    const { client, calls } = createFakeSdkClient({
      listResult: { data: [sampleRow], error: null },
      insertResult: { data: null, error: null },
    });
    const remote = new SupabaseSuggestionsRemoteClient(client);

    const result = await remote.listRows();

    expect(calls.table).toBe('suggestions');
    expect(calls.selectColumns).toBe(SUGGESTION_COLUMNS);
    expect(calls.order).toEqual({ column: 'created_at', ascending: false });
    expect(result.error).toBeNull();
    expect(result.data).toEqual([sampleRow]);
  });

  it('INSERT は default 列を送らず、作成行を返す', async () => {
    const inserted: SuggestionRow = {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      ...sampleInsert,
      created_at: '2026-09-08T12:00:00.000Z',
    };
    const { client, calls } = createFakeSdkClient({
      listResult: { data: [], error: null },
      insertResult: { data: inserted, error: null },
    });
    const remote = new SupabaseSuggestionsRemoteClient(client);

    const result = await remote.insertRow(sampleInsert);

    expect(calls.table).toBe('suggestions');
    expect(calls.insertPayload).toEqual(sampleInsert);
    expect(calls.insertPayload).not.toHaveProperty('id');
    expect(calls.insertPayload).not.toHaveProperty('created_at');
    expect(calls.insertSelectColumns).toBe(SUGGESTION_COLUMNS);
    expect(result.error).toBeNull();
    expect(result.data).toEqual(inserted);
  });

  it('SELECT error を成功扱いにしない', async () => {
    const { client } = createFakeSdkClient({
      listResult: {
        data: null,
        error: { message: 'permission denied for table suggestions' },
      },
      insertResult: { data: null, error: null },
    });

    const result = await new SupabaseSuggestionsRemoteClient(client).listRows();

    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      message: 'permission denied for table suggestions',
    });
  });

  it('INSERT error を成功扱いにしない', async () => {
    const { client } = createFakeSdkClient({
      listResult: { data: [], error: null },
      insertResult: {
        data: null,
        error: { message: 'new row violates row-level security' },
      },
    });

    const result = await new SupabaseSuggestionsRemoteClient(client).insertRow(
      sampleInsert,
    );

    expect(result.data).toBeNull();
    expect(result.error).toEqual({
      message: 'new row violates row-level security',
    });
  });

  it('環境変数が無いときは factory がクライアントを作らない', () => {
    expect(
      tryCreateSupabaseSuggestionsRemoteClientFromEnv({
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_PUBLISHABLE_KEY: '',
      }),
    ).toBeNull();
    expect(
      tryCreateSupabaseSuggestionsRemoteClientFromEnv({}),
    ).toBeNull();
  });
});
