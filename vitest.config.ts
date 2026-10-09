import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Mirrors the two tsconfig paths entries:
//   "@/*": ["./src/*", "./*"]
// Root-level modules take priority; everything else resolves into ./src.
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/(auth\.config|auth|firebaseConfig|index)$/,
        replacement: path.resolve(__dirname, '$1'),
      },
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, 'src/$1'),
      },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*.test.ts'],
  },
})
