import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{js,ts,tsx}', 'src/**/__tests__/**/*.{test,spec}.{js,ts,tsx}'],
    exclude: ['node_modules', '**/Одностраничный сайт для студии (Copy)/**'],
    setupFiles: ['src/test/setupTests.ts'],
  },
})
