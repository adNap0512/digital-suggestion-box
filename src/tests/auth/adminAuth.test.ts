import { describe, expect, it } from 'vitest';
import {
  ADMIN_LOGIN_ERROR_MESSAGE,
  readAdminDemoCredentials,
  verifyAdminCredentials,
} from '../../auth/adminAuth';

const demoEnv = {
  VITE_ADMIN_ID: 'demo-admin',
  VITE_ADMIN_PASSWORD: 'demo-password',
};

describe('adminAuth', () => {
  it('環境変数が揃っているときだけ仮認証情報を返す', () => {
    expect(readAdminDemoCredentials(demoEnv)).toEqual({
      adminId: 'demo-admin',
      password: 'demo-password',
    });
  });

  it('環境変数が無いときは照合できない', () => {
    expect(readAdminDemoCredentials({})).toBeNull();
    expect(verifyAdminCredentials('demo-admin', 'demo-password', {})).toBe(
      false,
    );
  });

  it('正しい認証情報なら成功する', () => {
    expect(
      verifyAdminCredentials('demo-admin', 'demo-password', demoEnv),
    ).toBe(true);
  });

  it('管理者IDが一致しないと失敗する', () => {
    expect(
      verifyAdminCredentials('other-admin', 'demo-password', demoEnv),
    ).toBe(false);
  });

  it('パスワードが一致しないと失敗する', () => {
    expect(
      verifyAdminCredentials('demo-admin', 'wrong-password', demoEnv),
    ).toBe(false);
  });

  it('ログイン失敗メッセージを固定する', () => {
    expect(ADMIN_LOGIN_ERROR_MESSAGE).toBe(
      '管理者IDまたはパスワードが正しくありません。',
    );
  });

  it('本番ビルドでは環境変数があっても照合しない', () => {
    expect(
      verifyAdminCredentials('demo-admin', 'demo-password', demoEnv, true),
    ).toBe(false);
  });
});
