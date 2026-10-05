import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { SuggestionsProvider } from '../../context/SuggestionsContext';
import { mockSuggestions } from '../../data/mockSuggestions';
import { AdminListPage } from '../../pages/AdminListPage';

async function renderAdminPage() {
  const view = render(
    <SuggestionsProvider>
      <BrowserRouter>
        <AdminListPage />
      </BrowserRouter>
    </SuggestionsProvider>,
  );
  await screen.findAllByTestId('suggestion-card');
  return view;
}

describe('AdminListPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('管理者認証が未実装であることを表示する', async () => {
    await renderAdminPage();
    expect(screen.getByTestId('admin-auth-notice')).toHaveTextContent(
      '管理者認証は未実装',
    );
  });

  it('ステータス変更UIが表示される', async () => {
    const user = userEvent.setup();
    await renderAdminPage();
    await user.click(screen.getAllByTestId('suggestion-card')[0]);
    expect(screen.getByTestId('admin-status-select')).toBeInTheDocument();
  });

  it('回答入力欄が表示される', async () => {
    const user = userEvent.setup();
    await renderAdminPage();
    await user.click(screen.getAllByTestId('suggestion-card')[0]);
    expect(screen.getByTestId('admin-response-input')).toBeInTheDocument();
  });

  it('ステータスを更新できる', async () => {
    const user = userEvent.setup();
    await renderAdminPage();
    await user.click(screen.getAllByTestId('suggestion-card')[0]);
    await user.selectOptions(screen.getByTestId('admin-status-select'), '対応済み');
    await user.click(screen.getByTestId('admin-status-save'));
    const detail = screen.getByTestId('detail-panel');
    expect(within(detail).getByTestId('status-badge')).toHaveTextContent(
      '対応済み',
    );
  });

  it('回答を保存できる', async () => {
    const user = userEvent.setup();
    await renderAdminPage();
    await user.click(screen.getAllByTestId('suggestion-card')[0]);
    await user.type(screen.getByTestId('admin-response-input'), '対応予定です');
    await user.click(screen.getByTestId('admin-response-save'));
    expect(screen.getByTestId('detail-response')).toHaveTextContent('回答あり');
  });

  it('確認後に投稿を削除し、一覧から外す', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await renderAdminPage();
    const title = mockSuggestions[0].title;
    await user.click(screen.getByText(title));
    await user.click(screen.getByTestId('admin-delete'));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByText(title)).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('suggestion-card')).toHaveLength(
      mockSuggestions.length - 1,
    );
  });

  it('確認をキャンセルした投稿は残る', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    await renderAdminPage();
    const title = mockSuggestions[0].title;
    await user.click(screen.getAllByTestId('suggestion-card')[0]);
    await user.click(screen.getByTestId('admin-delete'));

    expect(screen.getAllByText(title).length).toBeGreaterThan(0);
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
    expect(screen.getAllByTestId('suggestion-card')).toHaveLength(
      mockSuggestions.length,
    );
  });
});
