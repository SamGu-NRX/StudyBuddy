'use client'

import { FC, ReactNode } from 'react'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Toast provider for the chat feature.
 *
 * Renders a sonner `<Toaster>` (top-center) above `children`. The app does
 * not currently mount this component — the root layout instead uses
 * `src/app/providers.tsx` (a next-auth SessionProvider wrapper) — so this
 * exists as the chat feature's toast provider.
 */
const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      <Toaster position='top-center' />
      {children}
    </>
  )
}

export default Providers