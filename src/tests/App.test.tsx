import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';

describe('App', () => {
  it('トップページが表示される', async () => {
    render(<App />);
    expect(screen.getByTestId('top-page')).toBeInTheDocument();
    await screen.findAllByTestId('suggestion-card');
  });
});
