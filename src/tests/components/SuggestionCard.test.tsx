import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SuggestionCard } from '../../components/SuggestionCard/SuggestionCard';
import { mockSuggestions } from '../../data/mockSuggestions';

describe('SuggestionCard', () => {
  it('詳細を見るボタンがあるときだけ詳細操作できる', async () => {
    const user = userEvent.setup();
    const onViewDetail = vi.fn();
    render(
      <SuggestionCard
        suggestion={mockSuggestions[0]}
        onViewDetail={onViewDetail}
      />,
    );
    await user.click(screen.getByTestId('view-detail'));
    expect(onViewDetail).toHaveBeenCalledTimes(1);
  });

  it('詳細導線が無いカードはポインタ操作用にしない', () => {
    render(<SuggestionCard suggestion={mockSuggestions[0]} />);
    expect(screen.queryByTestId('view-detail')).not.toBeInTheDocument();
    expect(screen.getByTestId('suggestion-card')).not.toHaveClass(
      'suggestion-card--interactive',
    );
  });

  it('匿名投稿は匿名と表示する', () => {
    render(<SuggestionCard suggestion={mockSuggestions[1]} />);
    expect(screen.getByTestId('author-label')).toHaveTextContent('匿名');
  });

  it('記名投稿は投稿者名を表示する', () => {
    render(<SuggestionCard suggestion={mockSuggestions[0]} />);
    expect(screen.getByTestId('author-label')).toHaveTextContent('田中');
  });

  it('共感ボタンは詳細と独立して動く', async () => {
    const user = userEvent.setup();
    const onViewDetail = vi.fn();
    const onEmpathize = vi.fn();
    render(
      <SuggestionCard
        suggestion={mockSuggestions[0]}
        onViewDetail={onViewDetail}
        onEmpathize={onEmpathize}
      />,
    );
    await user.click(screen.getByTestId('empathy-button'));
    expect(onEmpathize).toHaveBeenCalledTimes(1);
    expect(onViewDetail).not.toHaveBeenCalled();
  });
});
