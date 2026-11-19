export const ADMIN_LOGIN_ERROR_MESSAGE =
  '管理者IDまたはパスワードが正しくありません。';

export type AdminCredentialSource = {
  VITE_ADMIN_ID?: string;
  VITE_ADMIN_PASSWORD?: string;
};

function readDevEnvCredentials(): AdminCredentialSource {
  // PROD ではこの関数ごと落とせるように、本番分岐の外では env を読まない
  if (import.meta.env.PROD) {
    return {};
  }
  return {
    VITE_ADMIN_ID: import.meta.env.VITE_ADMIN_ID,
    VITE_ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD,
  };
}

/**
 * 仮認証の照合先は開発時の環境変数のみ。ソースへ固定値を書かない。
 * VITE_ はクライアントに出るため、公開ビルドでは読まない。
 */
export function readAdminDemoCredentials(
  source?: AdminCredentialSource,
  isProductionBuild = import.meta.env.PROD,
): { adminId: string; password: string } | null {
  if (isProductionBuild) {
    return null;
  }
  const env = source ?? readDevEnvCredentials();
  const adminId = env.VITE_ADMIN_ID?.trim() ?? '';
  const password = env.VITE_ADMIN_PASSWORD ?? '';
  if (!adminId || password.length === 0) {
    return null;
  }
  return { adminId, password };
}

export function verifyAdminCredentials(
  adminId: string,
  password: string,
  source?: AdminCredentialSource,
  isProductionBuild = import.meta.env.PROD,
): boolean {
  const expected = readAdminDemoCredentials(source, isProductionBuild);
  if (!expected) {
    return false;
  }
  return adminId === expected.adminId && password === expected.password;
}
