import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SuggestionsProvider } from '../../context/SuggestionsContext';
import { TopPage } from '../../pages/TopPage';

async function renderTopPage() {
  const view = render(
    <SuggestionsProvider>
      <BrowserRouter>
        <TopPage />
      </BrowserRouter>
    </SuggestionsProvider>,
  );
  await screen.findAllByTestId('suggestion-card');
  return view;
}

describe('TopPage', () => {
  it('タイトルが表示される', async () => {
    await renderTopPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'デジタル目安箱',
    );
  });

  it('投稿するボタンが表示される', async () => {
    await renderTopPage();
    expect(screen.getByTestId('cta-post')).toHaveTextContent('投稿する');
  });

  it('みんなの投稿を見るボタンが表示される', async () => {
    await renderTopPage();
    expect(screen.getByTestId('cta-all-list')).toHaveTextContent(
      'みんなの投稿を見る',
    );
  });

  it('自分の投稿を見るボタンが表示される', async () => {
    await renderTopPage();
    expect(screen.getByTestId('cta-my-list')).toHaveTextContent(
      '自分の投稿を見る',
    );
  });

  it('サマリーカードが表示される', async () => {
    await renderTopPage();
    expect(screen.getAllByTestId('summary-card').length).toBe(3);
  });
});
