/**
 * Smoke test: proves the test infrastructure works against unmodified main.
 * Asserts the Overlay's first wizard step renders inside ClientOverlay.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { resetDomState } from './mocks'
import ClientOverlay from '../ClientOverlay'

describe('smoke: Onboarding test infrastructure', () => {
  beforeEach(() => {
    resetDomState()
  })

  it('renders the education step of the onboarding wizard', () => {
    render(<ClientOverlay />)
    expect(
      screen.getByText('What is your current level of education?'),
    ).toBeDefined()
  })
})
