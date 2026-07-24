import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SuggestionsProvider } from '../../context/SuggestionsContext';
import { PostFormPage } from '../../pages/PostFormPage';
import { ListDetailPage } from '../../pages/ListDetailPage';

function renderPostFormPage() {
  return render(
    <SuggestionsProvider>
      <MemoryRouter initialEntries={['/post']}>
        <Routes>
          <Route path="/post" element={<PostFormPage />} />
          <Route path="/list" element={<ListDetailPage />} />
        </Routes>
      </MemoryRouter>
    </SuggestionsProvider>,
  );
}

describe('PostFormPage', () => {
  it('カテゴリを選択できる', () => {
    renderPostFormPage();
    expect(screen.getByTestId('input-category')).toBeInTheDocument();
  });

  it('匿名 / 記名を選択できる', () => {
    renderPostFormPage();
    expect(screen.getByTestId('input-anonymous')).toBeInTheDocument();
    expect(screen.getByTestId('input-named')).toBeInTheDocument();
  });

  it('タイトルを入力できる', async () => {
    const user = userEvent.setup();
    renderPostFormPage();
    const input = screen.getByTestId('input-title');
    await user.type(input, 'テストタイトル');
    expect(input).toHaveValue('テストタイトル');
  });

  it('本文を入力できる', async () => {
    const user = userEvent.setup();
    renderPostFormPage();
    const input = screen.getByTestId('input-body');
    await user.type(input, 'テスト本文');
    expect(input).toHaveValue('テスト本文');
  });

  it('送信ボタンが表示される', () => {
    renderPostFormPage();
    expect(screen.getByTestId('btn-submit')).toHaveTextContent('送信');
  });

  it('下書き保存ボタンが表示される', async () => {
    const user = userEvent.setup();
    renderPostFormPage();
    expect(screen.getByTestId('btn-save-draft')).toHaveTextContent('下書き保存');
    await user.click(screen.getByTestId('btn-save-draft'));
    expect(screen.getByTestId('draft-saved')).toHaveTextContent('下書きを保存しました');
  });

  it('記名を選択すると名前入力欄が表示される', async () => {
    const user = userEvent.setup();
    renderPostFormPage();
    await user.click(screen.getByTestId('input-named'));
    expect(screen.getByTestId('input-author')).toBeInTheDocument();
  });

  it('送信すると一覧画面に遷移する', async () => {
    const user = userEvent.setup();
    renderPostFormPage();
    await user.type(screen.getByTestId('input-title'), '新しい投稿');
    await user.type(screen.getByTestId('input-body'), '本文テスト');
    await user.click(screen.getByTestId('btn-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('list-detail-page')).toBeInTheDocument();
    });
  });
});
