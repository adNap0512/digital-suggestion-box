import { getSupabaseClient } from '../services/supabaseClient';

type AdminAuthClient = {
  auth: {
    signInWithPassword: (args: {
      email: string;
      password: string;
    }) => Promise<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
    signOut: () => Promise<unknown>;
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
  };
  rpc: (
    fn: string,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

/** 管理者ID→メール対応は公開情報。パスワードや service_role は含めない。 */
export function getAdminAuthMapping(
  env: { VITE_ADMIN_LOGIN_ID?: string; VITE_ADMIN_AUTH_EMAIL?: string } = import.meta.env,
): { id: string; email: string } | null {
  const id = env.VITE_ADMIN_LOGIN_ID?.trim();
  const email = env.VITE_ADMIN_AUTH_EMAIL?.trim();
  return id && email ? { id, email } : null;
}

export async function authenticateSupabaseAdmin(
  id: string,
  password: string,
  client: AdminAuthClient | null = getSupabaseClient(),
  mapping = getAdminAuthMapping(),
): Promise<boolean> {
  if (!mapping || !client || id !== mapping.id) {
    return false;
  }
  const { data, error } = await client.auth.signInWithPassword({
    email: mapping.email,
    password,
  });
  if (error || !data.user) {
    return false;
  }
  const { data: isAdmin, error: roleError } = await client.rpc(
    'is_suggestion_admin',
  );
  if (roleError || isAdmin !== true) {
    await client.auth.signOut();
    return false;
  }
  return true;
}

export async function restoreSupabaseAdmin(
  client: AdminAuthClient | null = getSupabaseClient(),
): Promise<boolean> {
  if (!client) {
    return false;
  }
  const { data } = await client.auth.getUser();
  if (!data.user) {
    return false;
  }
  const { data: isAdmin, error } = await client.rpc('is_suggestion_admin');
  return !error && isAdmin === true;
}

export async function signOutSupabaseAdmin(
  client: AdminAuthClient | null = getSupabaseClient(),
): Promise<void> {
  await client?.auth.signOut();
}
