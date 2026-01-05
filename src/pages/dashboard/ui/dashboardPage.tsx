import { useAtomValue, useSetAtom } from 'jotai'
import { expensesAtom, incomeAtom, loadTransactionsFromDB } from '@/entities/transaction'
import { loadRulesFromDB } from '@/entities/rule'
import { loadBudgetsFromDB } from '@/entities/budget'
import { migrateFromLocalStorage } from '@/shared'
import { formatCurrency } from '@/shared/lib/formatters'
import { Box, VStack, HStack, Heading, Text, Button, SimpleGrid } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CsvUploader } from '@/widgets/csvUploader'
import { DateRangePicker } from '@/widgets/dateRangeFilter'
import { ExpensePieChart } from '@/widgets/expenseBreakdown'
import { TransactionsList } from '@/widgets/transactionsList'
import { TrendChart } from '@/widgets/spendingTrends'
import { ClearStorageButton } from '@/widgets/clearStorage'
import { BudgetTiles } from '@/widgets/budgetTiles'
import { BudgetSetupDialog } from '@/widgets/budgetSetup'
import { LeaksWidget } from '@/widgets/leaksWidget'
import { TopMerchantsWidget } from '@/widgets/topMerchantsWidget'
import { LanguageSwitcher } from '@/widgets/languageSwitcher'
import { RulesManager } from '@/widgets/rulesManager'

type Props = {
  className?: string
}

export const DashboardPage = ({ className }: Props) => {
  const { t } = useTranslation()
  const expenses = useAtomValue(expensesAtom)
  const income = useAtomValue(incomeAtom)
  const loadTransactions = useSetAtom(loadTransactionsFromDB)
  const loadRules = useSetAtom(loadRulesFromDB)
  const loadBudgets = useSetAtom(loadBudgetsFromDB)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      await migrateFromLocalStorage()
      await loadTransactions()
      await loadRules()
      await loadBudgets()
      setIsInitialized(true)
    }
    initialize()
  }, [loadTransactions, loadRules, loadBudgets])

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

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Text>{t('dashboard.loading', 'Loading...')}</Text>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8 ${className || ''}`}>
      <Box maxW="1600px" mx="auto">
        <VStack gap={8} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size="2xl" className="text-gray-800">
              {t('dashboard.title', 'Budget Tracker')}
            </Heading>
            <HStack gap={4}>
              <LanguageSwitcher />
              <Button 
                colorPalette="blue" 
                onClick={() => setBudgetDialogOpen(true)}
              >
                {t('dashboard.setupBudget', 'Setup Budget')}
              </Button>
            </HStack>
          </HStack>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <VStack gap={4}>
              <HStack justify="space-between" w="full">
                <Heading size="lg" className="text-gray-700">
                  {t('dashboard.uploadTransactions')}
                </Heading>
                <ClearStorageButton />
              </HStack>
              <CsvUploader />
            </VStack>
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <DateRangePicker />
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Box p={6} className="shadow-lg bg-white rounded-lg">
              <VStack gap={2}>
                <Text className="text-gray-600">{t('dashboard.totalIncome')}</Text>
                <Text className="text-3xl font-bold text-green-600">
                  {formatCurrency(totals.income)}
                </Text>
              </VStack>
            </Box>
            <Box p={6} className="shadow-lg bg-white rounded-lg">
              <VStack gap={2}>
                <Text className="text-gray-600">{t('dashboard.totalExpenses')}</Text>
                <Text className="text-3xl font-bold text-red-600">
                  {formatCurrency(totals.expenses)}
                </Text>
              </VStack>
            </Box>
            <Box p={6} className="shadow-lg bg-white rounded-lg">
              <VStack gap={2}>
                <Text className="text-gray-600">{t('dashboard.balance')}</Text>
                <Text className={`text-3xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.balance)}
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          <BudgetTiles />

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <LeaksWidget period="week" />
            <TopMerchantsWidget period="month" limit={10} />
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
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
          </SimpleGrid>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <RulesManager />
          </Box>

          <Box p={6} className="shadow-lg bg-white rounded-lg">
            <TransactionsList />
          </Box>
        </VStack>
      </Box>

      <BudgetSetupDialog 
        open={budgetDialogOpen} 
        onClose={() => setBudgetDialogOpen(false)} 
      />
    </div>
  )
}

