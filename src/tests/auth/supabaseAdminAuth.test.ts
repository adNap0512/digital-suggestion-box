import { describe, expect, it, vi } from 'vitest';
import {
  authenticateSupabaseAdmin,
  getAdminAuthMapping,
  restoreSupabaseAdmin,
  signOutSupabaseAdmin,
} from '../../auth/supabaseAdminAuth';

const mappingEnv = {
  VITE_ADMIN_LOGIN_ID: 'EFU_2099010101',
  VITE_ADMIN_AUTH_EMAIL: 'admin@example.com',
};

function createClient(options: {
  signInOk?: boolean;
  isAdmin?: boolean;
  hasUser?: boolean;
}) {
  return {
    auth: {
      signInWithPassword: vi.fn(async () => ({
        data: { user: options.signInOk === false ? null : { id: 'user-1' } },
        error:
          options.signInOk === false ? { message: 'invalid' } : null,
      })),
      signOut: vi.fn(async () => undefined),
      getUser: vi.fn(async () => ({
        data: { user: options.hasUser === false ? null : { id: 'user-1' } },
      })),
    },
    rpc: vi.fn(async () => ({
      data: options.isAdmin === false ? false : true,
      error: null,
    })),
  };
}

describe('supabaseAdminAuth', () => {
  it('IDとメールの対応だけを公開情報として返す', () => {
    expect(getAdminAuthMapping(mappingEnv)).toEqual({
      id: 'EFU_2099010101',
      email: 'admin@example.com',
    });
    expect(getAdminAuthMapping({})).toBeNull();
  });

  it('正しいIDとパスワードかつ管理者ロールなら成功する', async () => {
    const client = createClient({ signInOk: true, isAdmin: true });
    await expect(
      authenticateSupabaseAdmin(
        'EFU_2099010101',
        'secret',
        client,
        getAdminAuthMapping(mappingEnv),
      ),
    ).resolves.toBe(true);
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });

  it('管理者IDが一致しないと失敗する', async () => {
    const client = createClient({});
    await expect(
      authenticateSupabaseAdmin(
        'other-id',
        'secret',
        client,
        getAdminAuthMapping(mappingEnv),
      ),
    ).resolves.toBe(false);
    expect(client.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('パスワード不一致なら失敗する', async () => {
    const client = createClient({ signInOk: false });
    await expect(
      authenticateSupabaseAdmin(
        'EFU_2099010101',
        'wrong',
        client,
        getAdminAuthMapping(mappingEnv),
      ),
    ).resolves.toBe(false);
  });

  it('管理者ロールでなければサインアウトして失敗する', async () => {
    const client = createClient({ signInOk: true, isAdmin: false });
    await expect(
      authenticateSupabaseAdmin(
        'EFU_2099010101',
        'secret',
        client,
        getAdminAuthMapping(mappingEnv),
      ),
    ).resolves.toBe(false);
    expect(client.auth.signOut).toHaveBeenCalled();
  });

  it('セッション復元は管理者ロールがあるときだけ成功する', async () => {
    await expect(
      restoreSupabaseAdmin(createClient({ hasUser: true, isAdmin: true })),
    ).resolves.toBe(true);
    await expect(
      restoreSupabaseAdmin(createClient({ hasUser: true, isAdmin: false })),
    ).resolves.toBe(false);
    await expect(
      restoreSupabaseAdmin(createClient({ hasUser: false })),
    ).resolves.toBe(false);
  });

  it('ログアウトは Auth セッションを終了する', async () => {
    const client = createClient({});
    await signOutSupabaseAdmin(client);
    expect(client.auth.signOut).toHaveBeenCalled();
  });
});
