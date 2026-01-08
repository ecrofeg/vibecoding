import { Route, Switch, useLocation, Redirect, Link } from 'wouter'
import { DashboardPage } from '@/pages/dashboard'
import { BudgetPage } from '@/pages/budget'
import { LoginPage } from '@/pages/login'
import { Box, HStack, Text, Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { AuthGuard } from './providers'
import { useLogout, useAuth } from '@/features/auth'

const Navigation = () => {
  const { t } = useTranslation()
  const [location] = useLocation()
  const logoutMutation = useLogout()
  const { data: user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <Box p={4} className="bg-white shadow-md">
      <HStack gap={6} maxW="1400px" mx="auto" justifyContent="space-between">
        <HStack gap={6}>
          <Link href="/expenses">
            <Text
              className={`cursor-pointer font-medium ${
                location === '/expenses' || location === '/'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t('navigation.expenses')}
            </Text>
          </Link>
          <Link href="/budget">
            <Text
              className={`cursor-pointer font-medium ${
                location === '/budget'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {t('navigation.budget')}
            </Text>
          </Link>
        </HStack>
        <HStack gap={4}>
          <Text className="text-gray-600 text-sm">{user.username}</Text>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => logoutMutation.mutate()}
            loading={logoutMutation.isPending}
          >
            {t('auth.logout')}
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}

export const App = () => {
  return (
    <AuthGuard>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/expenses">
          <>
            <Navigation />
            <DashboardPage />
          </>
        </Route>
        <Route path="/budget">
          <>
            <Navigation />
            <BudgetPage />
          </>
        </Route>
        <Route path="/">
          <Redirect to="/expenses" />
        </Route>
      </Switch>
    </AuthGuard>
  )
}
