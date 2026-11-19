import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminAuthProvider } from '../../auth/AdminAuthContext';
import { RequireAdmin } from '../../auth/RequireAdmin';
import { Layout } from '../../components/Layout/Layout';
import { AdminLoginPage } from '../../pages/AdminLoginPage';

function renderLogin(initialPath = '/admin/login') {
  return render(
    <AdminAuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<div data-testid="top-page">トップ</div>} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<RequireAdmin />}>
              <Route
                path="/admin"
                element={<div data-testid="admin-list-page">管理</div>}
              />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AdminAuthProvider>,
  );
}

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ADMIN_ID', 'demo-admin');
    vi.stubEnv('VITE_ADMIN_PASSWORD', 'demo-password');
  });

  it('管理者ログイン画面を表示する', () => {
    renderLogin();
    expect(screen.getByTestId('admin-login-page')).toBeInTheDocument();
    expect(screen.getByLabelText('管理者ID')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByTestId('admin-login-submit')).toHaveTextContent(
      'ログイン',
    );
    expect(screen.getByTestId('admin-login-back')).toHaveTextContent(
      'トップへ戻る',
    );
    expect(screen.getByTestId('nav-admin-login')).toBeInTheDocument();
  });

  it('正しい認証情報で管理者画面へ遷移する', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByTestId('input-admin-id'), 'demo-admin');
    await user.type(screen.getByTestId('input-admin-password'), 'demo-password');
    await user.click(screen.getByTestId('admin-login-submit'));
    expect(await screen.findByTestId('admin-list-page')).toBeInTheDocument();
    expect(screen.getByTestId('nav-admin')).toBeInTheDocument();
    expect(screen.getByTestId('nav-logout')).toBeInTheDocument();
  });

  it('管理者ID不一致ではエラーを表示する', async () => {
    const user = userEvent.setup();
    const logSpy = vi.spyOn(console, 'log');
    renderLogin();
    await user.type(screen.getByTestId('input-admin-id'), 'wrong-id');
    await user.type(screen.getByTestId('input-admin-password'), 'demo-password');
    await user.click(screen.getByTestId('admin-login-submit'));
    expect(await screen.findByTestId('admin-login-error')).toHaveTextContent(
      '管理者IDまたはパスワードが正しくありません。',
    );
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });

  it('パスワード不一致ではエラーを表示する', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByTestId('input-admin-id'), 'demo-admin');
    await user.type(screen.getByTestId('input-admin-password'), 'wrong-password');
    await user.click(screen.getByTestId('admin-login-submit'));
    expect(await screen.findByTestId('admin-login-error')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-list-page')).not.toBeInTheDocument();
  });

  it('未ログインで管理者画面へアクセスするとログイン画面へ遷移する', () => {
    renderLogin('/admin');
    expect(screen.getByTestId('admin-login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-list-page')).not.toBeInTheDocument();
  });

  it('ログアウト後は管理者画面へ入れない', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByTestId('input-admin-id'), 'demo-admin');
    await user.type(screen.getByTestId('input-admin-password'), 'demo-password');
    await user.click(screen.getByTestId('admin-login-submit'));
    await user.click(screen.getByTestId('nav-logout'));
    await waitFor(() =>
      expect(screen.getByTestId('nav-admin-login')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('admin-login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-list-page')).not.toBeInTheDocument();
  });
});
