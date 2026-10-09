import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// Test/benchmark scope is intentionally limited to src/components/Onboarding/**.
// This config is measurement scaffolding only; it does not affect application code.
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'happy-dom',
    include: ['src/components/Onboarding/**/*.test.{ts,tsx}'],
    css: false,
  },
  bench: {
    environment: 'happy-dom',
    include: ['src/components/Onboarding/**/*.bench.{ts,tsx}'],
    css: false,
  },
})
