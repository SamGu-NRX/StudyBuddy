import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Overlay imports the real OCR component (Mantine + tesseract.js): stub it.
vi.mock('../../OCR/OCR', () => ({
  default: ({ onOcrComplete }: { onOcrComplete: (text: string) => void }) => (
    <button type="button" onClick={() => onOcrComplete('OCR TEXT')}>
      mock-ocr
    </button>
  ),
}));

import ClientOverlay from '../ClientOverlay';

describe('ClientOverlay (smoke)', () => {
  it('renders the onboarding overlay with the education question', () => {
    render(<ClientOverlay />);
    expect(
      screen.getByText('What is your current level of education?'),
    ).toBeInTheDocument();
  });
});
