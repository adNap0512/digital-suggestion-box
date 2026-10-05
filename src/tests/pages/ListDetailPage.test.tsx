import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SuggestionsProvider } from '../../context/SuggestionsContext';
import { ListDetailPage } from '../../pages/ListDetailPage';

async function renderListPage() {
  const view = render(
    <SuggestionsProvider>
      <BrowserRouter>
        <ListDetailPage />
      </BrowserRouter>
    </SuggestionsProvider>,
  );
  // list は Repository 経由の非同期取得。ローディング UI は足さず、テスト側で待つ
  await screen.findAllByTestId('suggestion-card');
  return view;
}

describe('ListDetailPage', () => {
  it('投稿カードが表示される', async () => {
    await renderListPage();
    expect(screen.getAllByTestId('suggestion-card').length).toBeGreaterThan(0);
  });

  it('カテゴリが表示される', async () => {
    await renderListPage();
    expect(screen.getAllByTestId('category-badge').length).toBeGreaterThan(0);
  });

  it('ステータスが表示される', async () => {
    await renderListPage();
    expect(screen.getAllByTestId('status-badge').length).toBeGreaterThan(0);
  });

  it('共感数が表示される', async () => {
    await renderListPage();
    expect(screen.getAllByTestId('empathy-count').length).toBeGreaterThan(0);
  });

  it('回答有無が表示される', async () => {
    await renderListPage();
    expect(screen.getAllByTestId('response-status').length).toBeGreaterThan(0);
  });

  it('フィルタを切り替えられる', async () => {
    const user = userEvent.setup();
    await renderListPage();
    const select = screen.getByTestId('filter-status');
    await user.selectOptions(select, '対応済み');
    expect(select).toHaveValue('対応済み');
  });

  it('共感ボタンを押すと共感数が増える', async () => {
    const user = userEvent.setup();
    await renderListPage();
    const buttons = screen.getAllByTestId('empathy-button');
    const countEl = screen.getAllByTestId('empathy-count')[0];
    const before = countEl.textContent;
    await user.click(buttons[0]);
    expect(countEl.textContent).not.toBe(before);
  });

  it('管理者向け操作は表示しない', async () => {
    await renderListPage();
    expect(screen.queryByTestId('admin-mode-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('admin-section')).not.toBeInTheDocument();
  });
});
