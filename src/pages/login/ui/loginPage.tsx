import { useState } from 'react'
import { useLocation } from 'wouter'
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Container,
  Heading,
} from '@chakra-ui/react'
import { useLogin, useAuth } from '@/features/auth'
import { useTranslation } from 'react-i18next'

export const LoginPage = () => {
  const { t } = useTranslation()
  const [, navigate] = useLocation()
  const { data: user, isLoading: isAuthLoading } = useAuth()
  const loginMutation = useLogin()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthLoading) {
    return null
  }

  if (user) {
    navigate('/expenses')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          navigate('/expenses')
        },
      }
    )
  }

  return (
    <Box minH="100vh" className="bg-gray-50 flex items-center justify-center">
      <Container maxW="400px">
        <Box className="bg-white rounded-lg shadow-lg p-8">
          <VStack gap={6}>
            <Heading size="lg" className="text-gray-800">
              {t('auth.login')}
            </Heading>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack gap={4}>
                <Box w="full">
                  <Text mb={2} className="text-gray-600 text-sm font-medium">
                    {t('auth.username')}
                  </Text>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('auth.usernamePlaceholder')}
                    className="w-full"
                    required
                  />
                </Box>

                <Box w="full">
                  <Text mb={2} className="text-gray-600 text-sm font-medium">
                    {t('auth.password')}
                  </Text>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full"
                    required
                  />
                </Box>

                {loginMutation.isError && (
                  <Text className="text-red-500 text-sm">
                    {t('auth.invalidCredentials')}
                  </Text>
                )}

                <Button
                  type="submit"
                  colorPalette="blue"
                  w="full"
                  loading={loginMutation.isPending}
                >
                  {t('auth.signIn')}
                </Button>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}
