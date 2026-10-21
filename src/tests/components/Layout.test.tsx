import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';

describe('Layout', () => {
  it('ヘッダーとナビゲーションが表示される', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    );
    expect(screen.getByText('デジタル目安箱')).toBeInTheDocument();
    expect(screen.getByText('投稿する')).toBeInTheDocument();
  });

  it('みんなの投稿では mine なしのナビだけ active になる', () => {
    render(
      <MemoryRouter initialEntries={['/list']}>
        <Layout />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('nav-all-list')).toHaveClass('active');
    expect(screen.getByTestId('nav-my-list')).not.toHaveClass('active');
  });

  it('自分の投稿では mine=1 のナビだけ active になる', () => {
    render(
      <MemoryRouter initialEntries={['/list?mine=1']}>
        <Layout />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('nav-my-list')).toHaveClass('active');
    expect(screen.getByTestId('nav-all-list')).not.toHaveClass('active');
  });
});
