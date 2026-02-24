import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/unit/specs/**/*.spec.js'],
    setupFiles: ['test/unit/setup.js'],
  },
  resolve: {
    alias: {
      common: resolve(__dirname, 'src/common'),
      muya: resolve(__dirname, 'src/muya'),
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
})
