/**
 * Shared test helpers for src/components/Onboarding tests and benchmarks.
 *
 * Import this module from every test/benchmark BEFORE importing components:
 * the vi.mock registrations below take effect for the whole import graph.
 *
 * Mocked collaborators (both out of scope for this work):
 *  - `src/components/OCR/OCR` pulls in Tesseract.js, Mantine, dropzone, crop.
 *  - `intro.js` drives global DOM state that tests must control.
 */
import { vi } from 'vitest'
import { createElement } from 'react'

/** Clears localStorage and body inline styles between tests. */
export function resetDomState() {
  window.localStorage.clear()
  document.body.style.overflow = ''
}

/**
 * Mock for src/components/OCR/OCR: renders a button that fires onOcrComplete
 * with the payload configured via setOcrPayload, so tests can drive OCR
 * completion without Tesseract.
 */
let ocrPayload = 'mocked OCR text'

export function setOcrPayload(text: string) {
  ocrPayload = text
}

vi.mock('../../OCR/OCR', () => ({
  default: function MockOCR({
    onOcrComplete,
  }: {
    onOcrComplete: (text: string) => void
  }) {
    return createElement(
      'button',
      {
        'data-testid': 'mock-ocr-complete',
        onClick: () => onOcrComplete(ocrPayload),
      },
      'mock-ocr',
    )
  },
}))

/**
 * Mock for intro.js. Captures constructed instances so tests can assert on
 * options and lifecycle without running the real tour.
 */
export interface MockIntroInstance {
  setOptions: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
  exit: ReturnType<typeof vi.fn>
}

const introInstances: MockIntroInstance[] = []

vi.mock('intro.js', () => {
  const IntroJsFactory = vi.fn(() => {
    const instance: MockIntroInstance = {
      setOptions: vi.fn(),
      start: vi.fn(),
      exit: vi.fn(),
    }
    introInstances.push(instance)
    return instance
  })
  return { default: IntroJsFactory, IntroJs: IntroJsFactory }
})

export function getIntroInstances(): MockIntroInstance[] {
  return introInstances
}

export function resetIntroInstances() {
  introInstances.length = 0
}
