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
      exclude: [
        'src/main.tsx',
        'src/utils/types.ts',
        'src/test/**',
        'vite.config.ts',
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
