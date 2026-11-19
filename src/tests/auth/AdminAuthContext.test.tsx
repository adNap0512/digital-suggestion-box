import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminAuthProvider, useAdminAuth } from '../../auth/AdminAuthContext';

function AuthProbe() {
  const { isAdmin, login, logout } = useAdminAuth();
  return (
    <div>
      <p data-testid="auth-state">{isAdmin ? 'in' : 'out'}</p>
      <button
        type="button"
        onClick={() => login('demo-admin', 'demo-password')}
      >
        ok
      </button>
      <button
        type="button"
        onClick={() => login('demo-admin', 'wrong-password')}
      >
        ng
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  );
}

describe('AdminAuthContext', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_ADMIN_ID', 'demo-admin');
    vi.stubEnv('VITE_ADMIN_PASSWORD', 'demo-password');
  });

  it('初期状態は未ログインで、成功後にログインしログアウトで破棄する', async () => {
    const user = userEvent.setup();
    render(
      <AdminAuthProvider>
        <AuthProbe />
      </AdminAuthProvider>,
    );

    expect(screen.getByTestId('auth-state')).toHaveTextContent('out');

    await user.click(screen.getByText('ng'));
    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('out'),
    );

    await user.click(screen.getByText('ok'));
    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('in'),
    );

    await user.click(screen.getByText('logout'));
    await waitFor(() =>
      expect(screen.getByTestId('auth-state')).toHaveTextContent('out'),
    );
  });
});
