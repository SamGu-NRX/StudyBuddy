# Onboarding tests

Run from the repo root:

```bash
pnpm test                        # full suite (vitest run)
npx vitest run src/components/Onboarding   # just this directory
```

Conventions every test file here follows:

- **File naming:** `<Component>.<concern>.test.tsx` inside `__tests__/`.
- **OCR stub:** `Overlay` imports `../OCR/OCR` (Mantine + tesseract.js — too heavy for
  unit tests). Stub it in files that render `Overlay`, `ClientOverlay`, or `Onboarding`:

  ```tsx
  vi.mock('../../OCR/OCR', () => ({
    default: ({ onOcrComplete }: { onOcrComplete: (text: string) => void }) => (
      <button type="button" onClick={() => onOcrComplete('OCR TEXT')}>mock-ocr</button>
    ),
  }));
  ```

  (Path is `../../OCR/OCR` because test files live one level deeper than the sources;
  vitest resolves it to the same module `Overlay` imports.)

- **Intro.js stub:** `Tutorial` starts a real IntroJs tour. Mock the module to observe
  lifecycle calls (`setOptions`, `start`, `exit`, `onexit`) instead of driving the real
  widget:

  ```tsx
  const introInstance = {
    setOptions: vi.fn(),
    start: vi.fn(),
    exit: vi.fn(),
    onexit: vi.fn(),
  };
  vi.mock('intro.js', () => ({ default: vi.fn(() => introInstance) }));
  ```

- **CSS:** `Overlay.module.css` is stubbed (vitest `css: false`) — never assert on
  class-name strings, assert on role/text instead.
- **localStorage:** cleared after every test by `src/test/setup.ts`. Seed it at the
  start of a test (not a `beforeEach`) when a component must see persisted state.
