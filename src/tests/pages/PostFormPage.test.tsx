import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SuggestionsProvider } from '../../context/SuggestionsContext';
import { PostFormPage } from '../../pages/PostFormPage';
import { ListDetailPage } from '../../pages/ListDetailPage';

async function renderPostFormPage() {
  const view = render(
    <SuggestionsProvider>
      <MemoryRouter initialEntries={['/post']}>
        <Routes>
          <Route path="/post" element={<PostFormPage />} />
          <Route path="/list" element={<ListDetailPage />} />
        </Routes>
      </MemoryRouter>
    </SuggestionsProvider>,
  );
  // 投稿画面にはカードが無いので、list の初期取得完了を microtask まで待つ
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

describe('PostFormPage', () => {
  it('カテゴリを選択できる', async () => {
    await renderPostFormPage();
    expect(screen.getByTestId('input-category')).toBeInTheDocument();
  });

  it('投稿者名を任意入力できる', async () => {
    await renderPostFormPage();
    expect(screen.getByTestId('input-author')).toBeInTheDocument();
    expect(screen.queryByTestId('input-anonymous')).not.toBeInTheDocument();
    expect(screen.queryByTestId('input-named')).not.toBeInTheDocument();
  });

  it('タイトルを入力できる', async () => {
    const user = userEvent.setup();
    await renderPostFormPage();
    const input = screen.getByTestId('input-title');
    await user.type(input, 'テストタイトル');
    expect(input).toHaveValue('テストタイトル');
  });

  it('本文を入力できる', async () => {
    const user = userEvent.setup();
    await renderPostFormPage();
    const input = screen.getByTestId('input-body');
    await user.type(input, 'テスト本文');
    expect(input).toHaveValue('テスト本文');
  });

  it('送信ボタンが表示される', async () => {
    await renderPostFormPage();
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('送信');
  });

  it('下書き保存ボタンが表示される', async () => {
    const user = userEvent.setup();
    await renderPostFormPage();
    expect(screen.getByTestId('btn-save-draft')).toHaveTextContent('下書き保存');
    await user.click(screen.getByTestId('btn-save-draft'));
    expect(screen.getByTestId('draft-saved')).toHaveTextContent('下書きを保存しました');
  });

  it('名前を空のまま送ると匿名で表示される', async () => {
    const user = userEvent.setup();
    await renderPostFormPage();
    await user.type(screen.getByTestId('input-title'), '匿名の投稿');
    await user.type(screen.getByTestId('input-body'), '本文テスト');
    await user.click(screen.getByTestId('btn-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('list-detail-page')).toBeInTheDocument();
    });
    expect(await screen.findByText('匿名の投稿')).toBeInTheDocument();
    const cards = screen.getAllByTestId('suggestion-card');
    expect(within(cards[0]).getByTestId('author-label')).toHaveTextContent(
      '匿名',
    );
  });

  it('名前を入力して送ると投稿者名が表示される', async () => {
    const user = userEvent.setup();
    await renderPostFormPage();
    await user.type(screen.getByTestId('input-author'), ' 山田太郎 ');
    await user.type(screen.getByTestId('input-title'), '記名の投稿');
    await user.type(screen.getByTestId('input-body'), '本文テスト');
    await user.click(screen.getByTestId('btn-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('list-detail-page')).toBeInTheDocument();
    });
    const cards = screen.getAllByTestId('suggestion-card');
    expect(within(cards[0]).getByTestId('author-label')).toHaveTextContent(
      '山田太郎',
    );
  });

  it('送信すると一覧画面に遷移する', async () => {
    const user = userEvent.setup();
    await renderPostFormPage();
    await user.type(screen.getByTestId('input-title'), '新しい投稿');
    await user.type(screen.getByTestId('input-body'), '本文テスト');
    await user.click(screen.getByTestId('btn-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('list-detail-page')).toBeInTheDocument();
    });
  });
});
