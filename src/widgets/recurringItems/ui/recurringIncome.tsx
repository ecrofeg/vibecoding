import { useAtom } from 'jotai'
import { budgetAtom, type RecurringIncome } from '@/entities/budget'
import { VStack, Heading, Button, HStack, Text, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/lib/formatters'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { RecurringItemForm } from './recurringItemForm'

export const RecurringIncome = () => {
  const { t } = useTranslation()
  const [budget, setBudget] = useAtom(budgetAtom)
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = (formData: {
    name: string
    amount: string
    period: string
    dayOfMonth?: string
    dayOfWeek?: string
    destination?: { type: 'card' } | { type: 'savings'; savingsAccountId: string }
  }) => {
    const newIncome: RecurringIncome = {
      id: uuidv4(),
      name: formData.name,
      amount: parseFloat(formData.amount) || 0,
      period: formData.period as RecurringIncome['period'],
      dayOfMonth: formData.dayOfMonth ? parseInt(formData.dayOfMonth) : undefined,
      dayOfWeek: formData.dayOfWeek ? parseInt(formData.dayOfWeek) : undefined,
      destination: formData.destination || { type: 'card' },
    }

    setBudget({
      ...budget,
      recurringIncome: [...budget.recurringIncome, newIncome],
    })

    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    setBudget({
      ...budget,
      recurringIncome: budget.recurringIncome.filter(inc => inc.id !== id),
    })
  }

  const getPeriodLabel = (income: RecurringIncome) => {
    if (income.period === 'weekly') {
      const dayNames = [
        t('budget.sunday'),
        t('budget.monday'),
        t('budget.tuesday'),
        t('budget.wednesday'),
        t('budget.thursday'),
        t('budget.friday'),
        t('budget.saturday'),
      ]
      return t('budget.everyWeek') + ' ' + (dayNames[income.dayOfWeek || 0] || '')
    }
    if (income.period === 'monthly_on_day') {
      return t('budget.everyMonth') + ' ' + income.dayOfMonth
    }
    return t('budget.monthly')
  }

  const getDestinationLabel = (income: RecurringIncome) => {
    if (income.destination.type === 'card') {
      return t('budget.toCard')
    }
    const account = budget.savingsAccounts.find(acc => acc.id === income.destination.savingsAccountId)
    return account ? account.name : t('budget.toSavings')
  }

  return (
    <VStack gap={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" className="text-gray-700">
          {t('budget.recurringIncome')}
        </Heading>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white">
            {t('budget.addRecurringIncome')}
          </Button>
        )}
      </HStack>

      {isAdding && (
        <RecurringItemForm
          savingsAccounts={budget.savingsAccounts}
          isIncome={true}
          onSubmit={handleAdd}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {budget.recurringIncome.length === 0 && !isAdding && (
        <Text className="text-gray-500">{t('budget.noRecurringIncome')}</Text>
      )}

      <VStack gap={2} align="stretch">
        {budget.recurringIncome.map((income) => (
          <Box key={income.id} p={4} className="bg-gray-50 rounded-lg">
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <Text className="font-medium">{income.name}</Text>
                <Text className="text-sm text-gray-600">
                  {formatCurrency(income.amount)} • {getPeriodLabel(income)} • {getDestinationLabel(income)}
                </Text>
              </VStack>
              <Button
                onClick={() => handleDelete(income.id)}
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

