import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Cloudflare Workers はルート配信（base: '/'）
  // GitHub Pages は GITHUB_PAGES=true でサブパス配信
  base: process.env.GITHUB_PAGES === 'true' ? '/digital-suggestion-box/' : '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      // アプリの src のみ集計する。dist / 依存 / テストは含めない
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/utils/types.ts',
        'src/test/**',
        'src/tests/**',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
})
