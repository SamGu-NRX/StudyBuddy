import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure a clean DOM and mock registry between tests.
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
