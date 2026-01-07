import { useAtom } from 'jotai'
import { budgetAtom, type RecurringExpense } from '@/entities/budget'
import { VStack, Heading, Button, HStack, Text, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/lib/formatters'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { RecurringItemForm } from './recurringItemForm'

export const RecurringExpenses = () => {
  const { t } = useTranslation()
  const [budget, setBudget] = useAtom(budgetAtom)
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = (formData: {
    name: string
    amount: string
    period: string
    dayOfMonth?: string
    dayOfWeek?: string
    source?: { type: 'card' } | { type: 'savings'; savingsAccountId: string }
  }) => {
    const newExpense: RecurringExpense = {
      id: uuidv4(),
      name: formData.name,
      amount: parseFloat(formData.amount) || 0,
      period: formData.period as RecurringExpense['period'],
      dayOfMonth: formData.dayOfMonth ? parseInt(formData.dayOfMonth) : undefined,
      dayOfWeek: formData.dayOfWeek ? parseInt(formData.dayOfWeek) : undefined,
      source: formData.source || { type: 'card' },
    }

    setBudget({
      ...budget,
      recurringExpenses: [...budget.recurringExpenses, newExpense],
    })

    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    setBudget({
      ...budget,
      recurringExpenses: budget.recurringExpenses.filter(exp => exp.id !== id),
    })
  }

  const getPeriodLabel = (expense: RecurringExpense) => {
    if (expense.period === 'weekly') {
      const dayNames = [
        t('budget.sunday'),
        t('budget.monday'),
        t('budget.tuesday'),
        t('budget.wednesday'),
        t('budget.thursday'),
        t('budget.friday'),
        t('budget.saturday'),
      ]
      return t('budget.everyWeek') + ' ' + (dayNames[expense.dayOfWeek || 0] || '')
    }
    if (expense.period === 'monthly_on_day') {
      return t('budget.everyMonth') + ' ' + expense.dayOfMonth
    }
    return t('budget.monthly')
  }

  const getSourceLabel = (expense: RecurringExpense) => {
    if (expense.source.type === 'card') {
      return t('budget.fromCard')
    }
    const account = budget.savingsAccounts.find(acc => acc.id === expense.source.savingsAccountId)
    return account?.name || t('budget.fromSavings')
  }

  return (
    <VStack gap={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" className="text-gray-700">
          {t('budget.recurringExpenses')}
        </Heading>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white">
            {t('budget.addRecurringExpense')}
          </Button>
        )}
      </HStack>

      {isAdding && (
        <RecurringItemForm
          savingsAccounts={budget.savingsAccounts}
          isIncome={false}
          onSubmit={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {budget.recurringExpenses.length === 0 && !isAdding && (
        <Text className="text-gray-500">{t('budget.noRecurringExpenses')}</Text>
      )}

      <VStack gap={2} align="stretch">
        {budget.recurringExpenses.map((expense) => (
          <Box key={expense.id} p={4} className="bg-gray-50 rounded-lg">
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <Text className="font-medium">{expense.name}</Text>
                <Text className="text-sm text-gray-600">
                  {formatCurrency(expense.amount)} • {getPeriodLabel(expense)} • {getSourceLabel(expense)}
                </Text>
              </VStack>
              <Button
                onClick={() => handleDelete(expense.id)}
                size="sm"
                variant="outline"
                className="text-red-600"
              >
                {t('common.delete')}
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>
    </VStack>
  )
}

