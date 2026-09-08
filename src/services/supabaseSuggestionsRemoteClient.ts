import { createClient } from '@supabase/supabase-js';
import type {
  RemoteQueryResult,
  SuggestionInsert,
  SuggestionRow,
  SuggestionsRemoteClient,
} from './supabaseSuggestionRepository';

/** Goal C の list / create に必要な列。migration と一致させる */
export const SUGGESTION_COLUMNS =
  'id, title, body, category, is_anonymous, author_name, created_at';

export interface SupabaseBrowserEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

/**
 * Adapter が使う SDK の最小面。
 * Repository はこれを知らず、from / select / insert の詳細はここに閉じる。
 */
export interface SuggestionsSupabaseClient {
  from(table: string): {
    select(columns: string): {
      order(
        column: string,
        options: { ascending: boolean },
      ): PromiseLike<RemoteQueryResult<SuggestionRow[]>>;
    };
    insert(values: SuggestionInsert): {
      select(columns: string): {
        single(): PromiseLike<RemoteQueryResult<SuggestionRow>>;
      };
    };
  };
}

/**
 * 公式 SDK を SuggestionsRemoteClient に合わせる。
 * pages / Context からは import しない。
 */
export class SupabaseSuggestionsRemoteClient implements SuggestionsRemoteClient {
  constructor(private readonly supabase: SuggestionsSupabaseClient) {}

  async listRows(): Promise<RemoteQueryResult<SuggestionRow[]>> {
    // Memory / Persistent が新しい投稿を先頭に置くので、同じ見え方にする
    const { data, error } = await this.supabase
      .from('suggestions')
      .select(SUGGESTION_COLUMNS)
      .order('created_at', { ascending: false });

    return toRemoteResult(data, error);
  }

  async insertRow(
    input: SuggestionInsert,
  ): Promise<RemoteQueryResult<SuggestionRow>> {
    const { data, error } = await this.supabase
      .from('suggestions')
      .insert(input)
      .select(SUGGESTION_COLUMNS)
      .single();

    return toRemoteResult(data, error);
  }
}

function toRemoteResult<T>(
  data: T | null,
  error: { message: string } | null,
): RemoteQueryResult<T> {
  if (error) {
    return { data: null, error: { message: error.message } };
  }
  return { data, error: null };
}

/**
 * URL / publishable key が揃ったときだけ実 Client を作る。
 * 未設定なら null。通常起動（Web Storage）を落とさない。
 */
export function tryCreateSupabaseSuggestionsRemoteClientFromEnv(
  env?: SupabaseBrowserEnv,
): SuggestionsRemoteClient | null {
  // Vite の ImportMetaEnv にはまだ VITE_SUPABASE_* が無いため、明示 env 優先で読む
  const source = env ?? (import.meta.env as unknown as SupabaseBrowserEnv);
  const url = source.VITE_SUPABASE_URL?.trim();
  const publishableKey = source.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) {
    return null;
  }

  return new SupabaseSuggestionsRemoteClient(createClient(url, publishableKey));
}
