import { ChakraProvider as ChakraUIProvider, defaultSystem } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export const ChakraProvider = ({ children }: Props) => {
  return (
    <ChakraUIProvider value={defaultSystem}>
      {children}
    </ChakraUIProvider>
  )
}

