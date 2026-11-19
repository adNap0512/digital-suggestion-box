import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Auth と Repository が同じセッションを使うための共有クライアント。 */
let sharedClient: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (sharedClient !== undefined) {
    return sharedClient;
  }
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  sharedClient = url && key ? createClient(url, key) : null;
  return sharedClient;
}

/** テスト間で接続先が漏れないようにする */
export function resetSupabaseClientForTests() {
  sharedClient = undefined;
}
