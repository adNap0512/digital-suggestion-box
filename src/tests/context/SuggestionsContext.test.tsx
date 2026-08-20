import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SuggestionsProvider, useSuggestions } from '../../context/SuggestionsContext';
import { mockSuggestions } from '../../data/mockSuggestions';
import type { SuggestionRepository } from '../../services/suggestionRepository';
import type { DraftForm, Suggestion } from '../../utils/types';

function Probe() {
  const { suggestions, addSuggestion } = useSuggestions();
  return (
    <div>
      <p data-testid="suggestion-count">{suggestions.length}</p>
      <ul>
        {suggestions.map((s) => (
          <li key={s.id}>{s.title}</li>
        ))}
      </ul>
      <button
        type="button"
        data-testid="probe-add"
        onClick={() =>
          addSuggestion({
            category: 'その他',
            isAnonymous: true,
            authorName: '',
            title: '境界経由の新規投稿',
            body: 'create を Repository 経由で確認',
          })
        }
      >
        add
      </button>
    </div>
  );
}

function createMockRepository(initial: Suggestion[]): SuggestionRepository {
  let items = initial.map((s) => ({ ...s }));
  return {
    list: vi.fn(async () => items.map((s) => ({ ...s }))),
    create: vi.fn(async (draft: DraftForm) => {
      const created: Suggestion = {
        id: 'created-1',
        title: draft.title,
        body: draft.body,
        category: draft.category,
        isAnonymous: draft.isAnonymous,
        authorName: draft.isAnonymous ? undefined : draft.authorName,
        status: '未確認',
        empathyCount: 0,
        hasResponse: false,
        createdAt: '2026-08-20T00:00:00.000Z',
        isMine: true,
      };
      items = [created, ...items];
      return { ...created };
    }),
  };
}

describe('SuggestionsContext', () => {
  it('list で取得した投稿を表示する', async () => {
    const repository = createMockRepository(mockSuggestions);
    render(
      <SuggestionsProvider repository={repository}>
        <Probe />
      </SuggestionsProvider>,
    );

    expect(await screen.findByText(mockSuggestions[0].title)).toBeInTheDocument();
    expect(repository.list).toHaveBeenCalled();
    expect(screen.getByTestId('suggestion-count')).toHaveTextContent(
      String(mockSuggestions.length),
    );
  });

  it('addSuggestion が create を呼び、新規投稿が一覧に出る', async () => {
    const user = userEvent.setup();
    const repository = createMockRepository(mockSuggestions);
    render(
      <SuggestionsProvider repository={repository}>
        <Probe />
      </SuggestionsProvider>,
    );

    await screen.findByText(mockSuggestions[0].title);
    await user.click(screen.getByTestId('probe-add'));

    expect(await screen.findByText('境界経由の新規投稿')).toBeInTheDocument();
    expect(repository.create).toHaveBeenCalled();
  });

  it('デフォルトRepositoryでは、再マウント後も create した投稿が残る', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <SuggestionsProvider>
        <Probe />
      </SuggestionsProvider>,
    );

    await screen.findByText(mockSuggestions[0].title);
    await user.click(screen.getByTestId('probe-add'));
    expect(await screen.findByText('境界経由の新規投稿')).toBeInTheDocument();
    unmount();

    render(
      <SuggestionsProvider>
        <Probe />
      </SuggestionsProvider>,
    );

    expect(await screen.findByText('境界経由の新規投稿')).toBeInTheDocument();
  });
});
