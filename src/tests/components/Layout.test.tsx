import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminAuthProvider } from '../../auth/AdminAuthContext';
import { Layout } from '../../components/Layout/Layout';

function renderLayout(path = '/') {
  return render(
    <AdminAuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Layout />
      </MemoryRouter>
    </AdminAuthProvider>,
  );
}

describe('Layout', () => {
  it('ヘッダーとナビゲーションが表示される', () => {
    renderLayout();
    expect(screen.getByText('デジタル目安箱')).toBeInTheDocument();
    expect(screen.getByText('投稿する')).toBeInTheDocument();
    expect(screen.getByTestId('nav-admin-login')).toHaveTextContent(
      '管理者ログイン',
    );
  });

  it('みんなの投稿では mine なしのナビだけ active になる', () => {
    renderLayout('/list');
    expect(screen.getByTestId('nav-all-list')).toHaveClass('active');
    expect(screen.getByTestId('nav-my-list')).not.toHaveClass('active');
  });

  it('自分の投稿では mine=1 のナビだけ active になる', () => {
    renderLayout('/list?mine=1');
    expect(screen.getByTestId('nav-my-list')).toHaveClass('active');
    expect(screen.getByTestId('nav-all-list')).not.toHaveClass('active');
  });
});
