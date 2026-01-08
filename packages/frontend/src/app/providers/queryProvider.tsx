import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/shared/api'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export const QueryProvider = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
