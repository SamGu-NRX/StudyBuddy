/**
 * Equivalence + behavior tests for the pages in src/app/dashboard/.
 *
 * The dashboard pages are thin client wrappers around feature components that
 * live outside src/app/dashboard/ (Dashboard, Flashcards, MCQ, Settings,
 * SidebarDash, HeaderDash). Those are stubbed here so the tests pin down the
 * behavior of the *pages themselves*: gating, rendering, and animation effects.
 *
 * gsap is NOT mocked: the ScrollTrigger bookkeeping it performs per mount is
 * part of the page behavior under test.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

// ---- Session mock: status/data controllable per test -----------------------
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

// ---- Feature components outside src/app/dashboard/ are stubbed -------------
vi.mock('@/components/Generation/Dashboard/Dashboard', () => ({
  default: () => <div data-testid="dashboard-feature" />,
}));
vi.mock('@/components/Generation/Dashboard/Flashcards', () => ({
  default: () => <div data-testid="flashcards-feature" />,
}));
vi.mock('@/components/Generation/Dashboard/MCQ', () => ({
  default: () => <div data-testid="mcq-feature" />,
}));
vi.mock('@/components/Generation/Dashboard/Settings', () => ({
  default: () => <div data-testid="settings-feature" />,
}));
vi.mock('@/components/SidebarDash', () => ({ default: () => <nav data-testid="sidebar" /> }));
vi.mock('@/components/HeaderDash', () => ({ default: () => <header data-testid="header" /> }));

import DashboardPage from '../page';
import GeneratePage from '../generate/page';
import SettingsPage from '../settings/page';

beforeEach(() => {
  sessionState.status = 'authenticated';
  sessionState.data = { user: { name: 'Test', email: 't@example.com' } };
  ScrollTrigger.getAll().splice(0, ScrollTrigger.getAll().length);
});

afterEach(() => {
  // Any ScrollTrigger created by a mounted page must be gone after unmount,
  // otherwise navigations leak triggers/listeners.
  ScrollTrigger.getAll().splice(0, ScrollTrigger.getAll().length);
});

describe('dashboard/page.tsx', () => {
  it('renders the loading placeholder while the session is loading', () => {
    sessionState.status = 'loading';
    const { container } = render(<DashboardPage />);
    expect(container.textContent).toBe('Loading...');
    expect(container).toMatchSnapshot();
  });

  it('renders the Dashboard feature once authenticated', () => {
    const { container } = render(<DashboardPage />);
    expect(container.querySelector('[data-testid="dashboard-feature"]')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });
});

describe('dashboard/generate/page.tsx', () => {
  it('renders the flashcards feature inside the page chrome', () => {
    const { container } = render(<GeneratePage />);
    expect(container.querySelector('[data-testid="flashcards-feature"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="sidebar"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="header"]')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });
});

describe('dashboard/settings/page.tsx', () => {
  it('renders the Settings feature once authenticated', () => {
    const { container } = render(<SettingsPage />);
    expect(container.querySelector('[data-testid="settings-feature"]')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('renders the loading placeholder while the session is loading', () => {
    sessionState.status = 'loading';
    const { container } = render(<SettingsPage />);
    expect(container.textContent).toBe('Loading...');
    expect(container).toMatchSnapshot();
  });
});
