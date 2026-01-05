import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Box, SimpleGrid, Heading, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { budgetsAtom, calculateBudgetStatus, getCurrentPeriod } from '@/entities/budget'
import { transactionsAtom } from '@/entities/transaction'
import { BudgetTile } from './budgetTile'

type Props = {
  className?: string
}

export const BudgetTiles = ({ className }: Props) => {
  const { t } = useTranslation()
  const budgets = useAtomValue(budgetsAtom)
  const transactions = useAtomValue(transactionsAtom)
  const currentPeriod = getCurrentPeriod()

  const currentBudgets = useMemo(() => {
    return budgets.filter(b => b.period === currentPeriod)
  }, [budgets, currentPeriod])

  const budgetStatuses = useMemo(() => {
    return currentBudgets.map(budget => 
      calculateBudgetStatus(budget, transactions)
    )
  }, [currentBudgets, transactions])

  if (budgetStatuses.length === 0) {
    return null
  }

  return (
    <Box className={className}>
      <VStack align="stretch" gap={4}>
        <Heading size="md">{t('budget.title', 'Budgets')}</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          {budgetStatuses.map(status => (
            <BudgetTile key={status.categoryId} status={status} />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
