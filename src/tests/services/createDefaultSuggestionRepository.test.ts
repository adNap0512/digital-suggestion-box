import { describe, expect, it } from 'vitest';
import { createDefaultSuggestionRepository } from '../../services/createDefaultSuggestionRepository';
import { PersistentSuggestionRepository } from '../../services/persistentSuggestionRepository';
import { SupabaseSuggestionRepository } from '../../services/supabaseSuggestionRepository';

describe('createDefaultSuggestionRepository', () => {
  it('env が無いときは Persistent Repository を選ぶ', () => {
    const repository = createDefaultSuggestionRepository({});

    expect(repository).toBeInstanceOf(PersistentSuggestionRepository);
  });

  it('URL か Key の片方だけでは Persistent にフォールバックする', () => {
    expect(
      createDefaultSuggestionRepository({
        VITE_SUPABASE_URL: 'https://example.supabase.co',
      }),
    ).toBeInstanceOf(PersistentSuggestionRepository);

    expect(
      createDefaultSuggestionRepository({
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_placeholder',
      }),
    ).toBeInstanceOf(PersistentSuggestionRepository);
  });

  it('URL と publishable key が揃うと Supabase Repository を選ぶ', () => {
    // createClient は query まで通信しない。list / create は呼ばない
    const repository = createDefaultSuggestionRepository({
      VITE_SUPABASE_URL: 'https://example.invalid.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_placeholder',
    });

    expect(repository).toBeInstanceOf(SupabaseSuggestionRepository);
  });
});
