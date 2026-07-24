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
});
