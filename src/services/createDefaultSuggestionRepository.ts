import { createPersistentSuggestionRepository } from './persistentSuggestionRepository';
import { tryCreateSupabaseSuggestionsRemoteClientFromEnv } from './supabaseSuggestionsRemoteClient';
import type { SupabaseBrowserEnv } from './supabaseSuggestionsRemoteClient';
import { SupabaseSuggestionRepository } from './supabaseSuggestionRepository';
import type { SuggestionRepository } from './suggestionRepository';

/**
 * 実行時の保存先を選ぶ。
 * Context は製品 API を知らず、この factory の戻り（契約）だけを使う。
 */
export function createDefaultSuggestionRepository(
  env?: SupabaseBrowserEnv,
): SuggestionRepository {
  const remote = tryCreateSupabaseSuggestionsRemoteClientFromEnv(env);
  if (remote) {
    return new SupabaseSuggestionRepository(remote);
  }

  // 未設定・片方だけは Persistent。PoC の通常起動を落とさない
  return createPersistentSuggestionRepository();
}
