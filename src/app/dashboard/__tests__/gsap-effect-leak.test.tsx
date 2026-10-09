/**
 * FAIL-FIRST performance/robustness tests for the gsap effect in
 * src/app/dashboard/generate/page.tsx (and the mcq route restored from the
 * same pattern in src/app/dashboard-force/MCQ/page.tsx).
 *
 * These tests are EXPECTED RED on main: the pages call fadeUp() with an
 * always-empty elementsRef array, yet gsap still creates ScrollTriggers (2 per
 * mount) and nothing reverts them on unmount, so triggers + scroll/resize
 * listeners accumulate across navigations (doubled in React StrictMode).
 *
 * They turn GREEN once the page fixes the effect (guard empty targets +
 * cleanup). Do not "fix" these tests to match the leak.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

type SessionState = { status: 'loading' | 'authenticated' | 'unauthenticated'; data: unknown };
const sessionState: SessionState = { status: 'authenticated', data: null };

vi.mock('next-auth/react', () => ({
  useSession: () => sessionState,
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/dashboard',
}));

vi.mock('@/components/Generation/Dashboard/Flashcards', () => ({
  default: () => <div data-testid="flashcards-feature" />,
}));
vi.mock('@/components/Generation/Dashboard/MCQ', () => ({
  default: () => <div data-testid="mcq-feature" />,
}));
vi.mock('@/components/SidebarDash', () => ({ default: () => <nav data-testid="sidebar" /> }));
vi.mock('@/components/HeaderDash', () => ({ default: () => <header data-testid="header" /> }));

import GeneratePage from '../generate/page';

const clearTriggers = () => {
  ScrollTrigger.getAll().splice(0, ScrollTrigger.getAll().length);
};

beforeEach(clearTriggers);
afterEach(clearTriggers);

describe('generate page gsap effect (red on main, green after fix)', () => {
  it('creates no ScrollTrigger work on mount because the target list is empty', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<GeneratePage />);
    expect(ScrollTrigger.getAll().length).toBe(0);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('reverts every ScrollTrigger on unmount (no leak across navigations)', () => {
    const { unmount } = render(<GeneratePage />);
    unmount();
    expect(ScrollTrigger.getAll().length).toBe(0);
  });

  it('stays clean under React StrictMode-style double mounting', () => {
    const first = render(<GeneratePage />);
    first.unmount();
    const second = render(<GeneratePage />);
    second.unmount();
    expect(ScrollTrigger.getAll().length).toBe(0);
  });
});
