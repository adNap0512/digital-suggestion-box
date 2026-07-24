import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FilterBar } from '../../components/FilterBar/FilterBar';

describe('FilterBar', () => {
  it('カテゴリフィルタを変更できる', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);
    await user.selectOptions(screen.getByTestId('filter-category'), '職場環境');
    expect(onChange).toHaveBeenCalled();
  });

  it('自分の投稿のみチェックを切り替えられる', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterBar filters={{}} onChange={onChange} />);
    await user.click(screen.getByTestId('filter-mine'));
    expect(onChange).toHaveBeenCalledWith({ mineOnly: true });
  });
});
