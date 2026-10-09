import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const rootDir = path.resolve(__dirname, '../../..');
const srcDir = path.resolve(rootDir, 'src');

// Mirrors tsconfig paths: "@/*" -> ["./src/*", "./*"]
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@\/\.\.\//, replacement: `${rootDir}/` },
      { find: /^@\//, replacement: `${srcDir}/` },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.resolve(__dirname, 'test/setup.ts')],
    include: ['src/app/dashboard/**/*.test.{ts,tsx}'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
