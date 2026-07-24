import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SuggestionsProvider } from '../../context/SuggestionsContext';
import { ListDetailPage } from '../../pages/ListDetailPage';

function renderListPage() {
  return render(
    <SuggestionsProvider>
      <BrowserRouter>
        <ListDetailPage />
      </BrowserRouter>
    </SuggestionsProvider>,
  );
}

describe('ListDetailPage', () => {
  it('投稿カードが表示される', () => {
    renderListPage();
    expect(screen.getAllByTestId('suggestion-card').length).toBeGreaterThan(0);
  });

  it('カテゴリが表示される', () => {
    renderListPage();
    expect(screen.getAllByTestId('category-badge').length).toBeGreaterThan(0);
  });

  it('ステータスが表示される', () => {
    renderListPage();
    expect(screen.getAllByTestId('status-badge').length).toBeGreaterThan(0);
  });

  it('共感数が表示される', () => {
    renderListPage();
    expect(screen.getAllByTestId('empathy-count').length).toBeGreaterThan(0);
  });

  it('回答有無が表示される', () => {
    renderListPage();
    expect(screen.getAllByTestId('response-status').length).toBeGreaterThan(0);
  });

  it('フィルタを切り替えられる', async () => {
    const user = userEvent.setup();
    renderListPage();
    const select = screen.getByTestId('filter-status');
    await user.selectOptions(select, '対応済み');
    expect(select).toHaveValue('対応済み');
  });

  it('共感ボタンを押すと共感数が増える', async () => {
    const user = userEvent.setup();
    renderListPage();
    const buttons = screen.getAllByTestId('empathy-button');
    const countEl = screen.getAllByTestId('empathy-count')[0];
    const before = countEl.textContent;
    await user.click(buttons[0]);
    expect(countEl.textContent).not.toBe(before);
  });

  it('管理者向けステータス変更UIが表示される', async () => {
    const user = userEvent.setup();
    renderListPage();
    await user.click(screen.getByTestId('admin-mode-toggle'));
    await user.click(screen.getAllByTestId('suggestion-card')[0]);
    expect(screen.getByTestId('admin-status-select')).toBeInTheDocument();
  });

  it('管理者向け回答入力欄が表示される', async () => {
    const user = userEvent.setup();
    renderListPage();
    await user.click(screen.getByTestId('admin-mode-toggle'));
    await user.click(screen.getAllByTestId('suggestion-card')[0]);
    expect(screen.getByTestId('admin-response-input')).toBeInTheDocument();
  });

  it('管理者がステータスを更新できる', async () => {
    const user = userEvent.setup();
    renderListPage();
    await user.click(screen.getByTestId('admin-mode-toggle'));
    await user.click(screen.getAllByTestId('suggestion-card')[0]);
    await user.selectOptions(screen.getByTestId('admin-status-select'), '対応済み');
    await user.click(screen.getByTestId('admin-status-save'));
    const detail = screen.getByTestId('detail-panel');
    expect(within(detail).getByTestId('status-badge')).toHaveTextContent('対応済み');
  });

  it('管理者が回答を保存できる', async () => {
    const user = userEvent.setup();
    renderListPage();
    await user.click(screen.getByTestId('admin-mode-toggle'));
    await user.click(screen.getAllByTestId('suggestion-card')[0]);
    await user.type(screen.getByTestId('admin-response-input'), '対応予定です');
    await user.click(screen.getByTestId('admin-response-save'));
    expect(screen.getByTestId('detail-response')).toHaveTextContent('回答あり');
  });
});
