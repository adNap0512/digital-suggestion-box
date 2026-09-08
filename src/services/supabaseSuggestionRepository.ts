import type { Category, DraftForm, Suggestion } from '../utils/types';
import type { SuggestionRepository } from './suggestionRepository';

/** migration `suggestions` と一致する行。UI の Suggestion とは 1 対 1 にしない */
export interface SuggestionRow {
  id: string;
  title: string;
  body: string;
  category: string;
  is_anonymous: boolean;
  author_name: string | null;
  created_at: string;
}

/** create が送る INSERT。id / created_at は DB 側の default に任せる */
export interface SuggestionInsert {
  title: string;
  body: string;
  category: string;
  is_anonymous: boolean;
  author_name: string | null;
}

export interface RemoteQueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

/**
 * Supabase JS の from().select / insert を隠す最小口。
 * テストは fake、後で実 Client を差し替える。pages / Context はこれを知らない。
 */
export interface SuggestionsRemoteClient {
  listRows(): Promise<RemoteQueryResult<SuggestionRow[]>>;
  insertRow(input: SuggestionInsert): Promise<RemoteQueryResult<SuggestionRow>>;
}

/**
 * Goal C 用 Repository。契約は既存の list / create のまま。
 * 実 Key や SDK には依存せず、クライアント境界だけを受け取る。
 */
export class SupabaseSuggestionRepository implements SuggestionRepository {
  constructor(private readonly client: SuggestionsRemoteClient) {}

  async list(): Promise<Suggestion[]> {
    const { data, error } = await this.client.listRows();
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => toSuggestion(row, { isMine: false }));
  }

  async create(draft: DraftForm): Promise<Suggestion> {
    const { data, error } = await this.client.insertRow(toInsert(draft));
    // 失敗を空の成功にしない。Context 未接続の今は呼び出し側で reject を見る
    if (error) {
      throw new Error(error.message);
    }
    if (!data) {
      throw new Error('suggestions insert returned no row');
    }
    // 今セッションの投稿なので Memory / Persistent の create と同じく isMine を true にする
    return toSuggestion(data, { isMine: true });
  }
}

function toInsert(draft: DraftForm): SuggestionInsert {
  return {
    title: draft.title,
    body: draft.body,
    category: draft.category,
    is_anonymous: draft.isAnonymous,
    author_name: draft.isAnonymous ? null : draft.authorName || null,
  };
}

function toSuggestion(
  row: SuggestionRow,
  options: { isMine: boolean },
): Suggestion {
  return {
    id: String(row.id),
    title: row.title,
    body: row.body,
    category: row.category as Category,
    isAnonymous: row.is_anonymous,
    authorName: row.is_anonymous || !row.author_name ? undefined : row.author_name,
    status: '未確認',
    empathyCount: 0,
    hasResponse: false,
    createdAt: row.created_at,
    isMine: options.isMine,
  };
}
