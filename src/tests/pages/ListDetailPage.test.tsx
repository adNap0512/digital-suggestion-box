import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom';
import { Layout } from '../../components/Layout/Layout';
import { SuggestionsProvider } from '../../context/SuggestionsContext';
import { mockSuggestions } from '../../data/mockSuggestions';
import { ListDetailPage } from '../../pages/ListDetailPage';
import { MemorySuggestionRepository } from '../../services/memorySuggestionRepository';

function LocationSearch() {
  const [searchParams] = useSearchParams();
  return <div data-testid="location-search">{searchParams.toString()}</div>;
}

async function renderListPage(initialPath = '/list') {
  const view = render(
    <SuggestionsProvider
      repository={new MemorySuggestionRepository(mockSuggestions)}
    >
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/list"
              element={
                <>
                  <LocationSearch />
                  <ListDetailPage />
                </>
              }
            />
            <Route path="/" element={<div />} />
            <Route path="/post" element={<div />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SuggestionsProvider>,
  );
  await screen.findAllByTestId('suggestion-card');
  return view;
}

const mineCount = mockSuggestions.filter((s) => s.isMine).length;

describe('ListDetailPage', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('みんなの投稿では全件表示する', async () => {
    await renderListPage('/list');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'みんなの投稿',
    );
    expect(screen.getAllByTestId('suggestion-card')).toHaveLength(
      mockSuggestions.length,
    );
  });

  it('自分の投稿では isMine の投稿のみ表示する', async () => {
    await renderListPage('/list?mine=1');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '自分の投稿',
    );
    expect(screen.getAllByTestId('suggestion-card')).toHaveLength(mineCount);
  });

  it('ナビで自分→みんなと切り替えても表示条件が戻る', async () => {
    const user = userEvent.setup();
    await renderListPage('/list?mine=1');
    expect(screen.getAllByTestId('suggestion-card')).toHaveLength(mineCount);

    await user.click(screen.getByTestId('nav-all-list'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'みんなの投稿',
    );
    expect(screen.getAllByTestId('suggestion-card')).toHaveLength(
      mockSuggestions.length,
    );

    await user.click(screen.getByTestId('nav-my-list'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '自分の投稿',
    );
    expect(screen.getAllByTestId('suggestion-card')).toHaveLength(mineCount);
  });

  it('チェックボックスでも URL の mine と一覧が同期する', async () => {
    const user = userEvent.setup();
    await renderListPage('/list?foo=keep');
    await user.click(screen.getByTestId('filter-mine'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      '自分の投稿',
    );
    expect(screen.getByTestId('location-search')).toHaveTextContent('foo=keep');
    expect(screen.getByTestId('location-search')).toHaveTextContent('mine=1');
    expect(screen.getAllByTestId('suggestion-card')).toHaveLength(mineCount);

    await user.click(screen.getByTestId('filter-mine'));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'みんなの投稿',
    );
    expect(screen.getByTestId('location-search')).toHaveTextContent('foo=keep');
    expect(screen.getByTestId('location-search')).not.toHaveTextContent(
      'mine=1',
    );
  });

  it('表示対象外になった投稿の詳細は閉じる', async () => {
    const user = userEvent.setup();
    await renderListPage('/list');
    const others = mockSuggestions.filter((s) => !s.isMine);
    await user.click(screen.getAllByTestId('view-detail')[0]);
    expect(screen.getByTestId('detail-panel')).toHaveTextContent(others[0].title);

    await user.click(screen.getByTestId('nav-my-list'));
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
  });

  it('詳細を見るでパネルを開き、閉じるで戻せる', async () => {
    const user = userEvent.setup();
    await renderListPage('/list');
    const openButtons = screen.getAllByTestId('view-detail');
    await user.click(openButtons[0]);
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
    await user.click(screen.getByTestId('detail-close'));
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
    await vi.waitFor(() => {
      expect(openButtons[0]).toHaveFocus();
    });
  });

  it('Escape でも詳細を閉じ、操作元へフォーカスを戻す', async () => {
    const user = userEvent.setup();
    await renderListPage('/list');
    const openButtons = screen.getAllByTestId('view-detail');
    await user.click(openButtons[1]);
    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('detail-panel')).not.toBeInTheDocument();
    await vi.waitFor(() => {
      expect(openButtons[1]).toHaveFocus();
    });
  });

  it('詳細表示後にパネルへスクロールする', async () => {
    const user = userEvent.setup();
    await renderListPage('/list');
    await user.click(screen.getAllByTestId('view-detail')[0]);
    await vi.waitFor(() => {
      expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    });
  });
});
