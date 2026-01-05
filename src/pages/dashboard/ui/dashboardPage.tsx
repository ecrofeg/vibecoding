import { useAtom } from 'jotai'
import { expensesAtom, incomeAtom } from '@/entities/transaction'
import { formatCurrency } from '@/shared/lib/formatters'
import { Box, VStack, HStack, Heading, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CsvUploader } from '@/widgets/csvUploader'
import { DateRangePicker } from '@/widgets/dateRangeFilter'
import { ExpensePieChart } from '@/widgets/expenseBreakdown'
import { TransactionsList } from '@/widgets/transactionsList'
import { TrendChart } from '@/widgets/spendingTrends'
import { ClearStorageButton } from '@/widgets/clearStorage'

type Props = {
  className?: string
}

export const DashboardPage = ({ className }: Props) => {
  const { t } = useTranslation()
  const [expenses] = useAtom(expensesAtom)
  const [income] = useAtom(incomeAtom)

  const totals = useMemo(() => {
    const totalExpenses = expenses.reduce((sum: number, tx) => sum + Math.abs(tx.amount), 0)
    const totalIncome = income.reduce((sum: number, tx) => sum + tx.amount, 0)
    const balance = totalIncome - totalExpenses

    return {
      expenses: totalExpenses,
      income: totalIncome,
      balance,
    }
  }, [expenses, income])

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 ${className || ''}`}>
      <Box maxW="1400px" mx="auto">
        <VStack gap={8} align="stretch">
          <Box p={6} className="shadow-lg bg-white rounded-lg">
              <VStack gap={4}>
              <Heading size="lg" className="text-gray-700">
                {t('dashboard.uploadTransactions')}
              </Heading>
              <CsvUploader />
              <ClearStorageButton />
            </VStack>
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
              <VStack gap={4}>
              <Heading size="lg" className="text-gray-700">
                {t('dashboard.dateRange')}
              </Heading>
              <DateRangePicker />
            </VStack>
          </Box>

          <HStack gap={4} align="stretch">
            <Box p={6} className="shadow-lg bg-white rounded-lg flex-1">
              <VStack gap={2}>
                <Text className="text-gray-600">{t('dashboard.totalIncome')}</Text>
                <Text className="text-3xl font-bold text-green-600">
                  {formatCurrency(totals.income)}
                </Text>
              </VStack>
            </Box>
            <Box p={6} className="shadow-lg bg-white rounded-lg flex-1">
              <VStack gap={2}>
                <Text className="text-gray-600">{t('dashboard.totalExpenses')}</Text>
                <Text className="text-3xl font-bold text-red-600">
                  {formatCurrency(totals.expenses)}
                </Text>
              </VStack>
            </Box>
            <Box p={6} className="shadow-lg bg-white rounded-lg flex-1">
              <VStack gap={2}>
                <Text className="text-gray-600">{t('dashboard.balance')}</Text>
                <Text className={`text-3xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.balance)}
                </Text>
              </VStack>
            </Box>
          </HStack>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
              <VStack gap={4}>
              <Heading size="lg" className="text-gray-700">
                {t('dashboard.expenseBreakdown')}
              </Heading>
              <ExpensePieChart />
            </VStack>
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <TrendChart months={6} />
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <TransactionsList />
          </Box>
        </VStack>
      </Box>
    </div>
  )
}

