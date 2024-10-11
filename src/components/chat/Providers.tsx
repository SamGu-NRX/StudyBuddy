'use client'

import { FC, ReactNode } from 'react'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: ReactNode
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      <Toaster position='top-center' reverseOrder={false} /> {/* TODO: fix this */}
      {children}
    </>
  )
}

export default Providers