import { Route, Switch, useLocation, Redirect, Link } from 'wouter'
import { DashboardPage } from '@/pages/dashboard'
import { BudgetPage } from '@/pages/budget'
import { Box, HStack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const Navigation = () => {
  const { t } = useTranslation()
  const [location] = useLocation()

  return (
    <Box p={4} className="bg-white shadow-md">
      <HStack gap={6} maxW="1400px" mx="auto">
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
    </Box>
  )
}

export const App = () => {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path="/expenses" component={DashboardPage} />
        <Route path="/budget" component={BudgetPage} />
        <Route path="/">
          <Redirect to="/expenses" />
        </Route>
      </Switch>
    </>
  )
}

