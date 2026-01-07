import { useAuth } from '@/features/auth'
import { Redirect, useLocation } from 'wouter'
import { Box, Spinner, Center } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export const AuthGuard = ({ children }: Props) => {
  const { data: user, isLoading, isError } = useAuth()
  const [location] = useLocation()

  if (location === '/login') {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  if (isError || !user) {
    return <Redirect to="/login" />
  }

  return <>{children}</>
}
