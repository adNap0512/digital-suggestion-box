import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import { resetSupabaseClientForTests } from '../services/supabaseClient';

// Persistent Repository のデフォルト保存口がテスト間で漏れないようにする
beforeEach(() => {
  localStorage.clear();
  resetSupabaseClientForTests();
});

