import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, QueryProvider } from '@/app/providers'
import { App } from '@/app'
import '@/app/styles/index.css'
import '@/shared/i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </QueryProvider>
  </StrictMode>,
)
