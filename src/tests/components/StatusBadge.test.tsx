import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from '../../components/StatusBadge/StatusBadge';

describe('StatusBadge', () => {
  it('ステータスを表示する', () => {
    render(<StatusBadge status="検討中" />);
    expect(screen.getByTestId('status-badge')).toHaveTextContent('検討中');
  });
});
