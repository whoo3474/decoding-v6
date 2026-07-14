import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'apps/cli/**/*.test.ts'],
    coverage: { reporter: ['text', 'json-summary'] },
  },
})
