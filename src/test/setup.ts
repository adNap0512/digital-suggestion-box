import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';

// Persistent Repository のデフォルト保存口がテスト間で漏れないようにする
beforeEach(() => {
  localStorage.clear();
});

