import { VStack, Box } from '@chakra-ui/react'
import { CurrentBalanceInput } from '@/widgets/currentBalance'
import { SavingsAccountsList } from '@/widgets/savingsAccounts'
import { RecurringExpenses } from '@/widgets/recurringItems'
import { RecurringIncome } from '@/widgets/recurringItems'
import { PlannedExpensesList } from '@/widgets/plannedExpenses'
import { ForecastChart } from '@/widgets/budgetForecast'

type Props = {
  className?: string
}

export const BudgetPage = ({ className }: Props) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 ${className || ''}`}>
      <Box maxW="1400px" mx="auto">
        <VStack gap={8} align="stretch">
          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <CurrentBalanceInput />
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <SavingsAccountsList />
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <RecurringIncome />
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <RecurringExpenses />
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <PlannedExpensesList />
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <ForecastChart />
          </Box>
        </VStack>
      </Box>
    </div>
  )
}

