import { useAtom } from 'jotai'
import { budgetAtom, type PlannedExpense, type ExpenseSource } from '@/entities/budget'
import { VStack, Heading, Button, HStack, Text, Box, Input, Field, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/lib/formatters'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export const PlannedExpensesList = () => {
  const { t } = useTranslation()
  const [budget, setBudget] = useAtom(budgetAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState<{
    name: string
    amount: string
    date: Date
    source: ExpenseSource
  }>({
    name: '',
    amount: '',
    date: new Date(),
    source: { type: 'card' },
  })

  const handleAdd = () => {
    if (!formData.name || !formData.amount) return

    const newExpense: PlannedExpense = {
      id: uuidv4(),
      name: formData.name,
      amount: parseFloat(formData.amount) || 0,
      date: formData.date,
      source: formData.source,
    }

    setBudget({
      ...budget,
      plannedExpenses: [...budget.plannedExpenses, newExpense].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      ),
    })

    setFormData({ name: '', amount: '', date: new Date(), source: { type: 'card' } })
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    setBudget({
      ...budget,
      plannedExpenses: budget.plannedExpenses.filter(exp => exp.id !== id),
    })
  }

  const getSourceLabel = (expense: PlannedExpense) => {
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
          {t('budget.plannedExpenses')}
        </Heading>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white">
            {t('budget.addPlannedExpense')}
          </Button>
        )}
      </HStack>

      {isAdding && (
        <Box p={4} className="bg-gray-50 rounded-lg">
          <VStack gap={4} align="stretch">
            <Field.Root>
              <Field.Label>{t('budget.expenseName')}</Field.Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('budget.expenseNamePlaceholder')}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t('budget.expenseAmount')}</Field.Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t('budget.expenseDate')}</Field.Label>
              <DatePicker
                selected={formData.date}
                onChange={(date: Date | null) => {
                  if (date) setFormData({ ...formData, date })
                }}
                dateFormat="dd.MM.yyyy"
                className="w-full p-2 border rounded"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t('budget.source')}</Field.Label>
              <NativeSelectRoot>
                <NativeSelectField
                  value={formData.source.type === 'savings' ? formData.source.savingsAccountId : 'card'}
                  onChange={(e) => {
                    if (e.target.value === 'card') {
                      setFormData({ ...formData, source: { type: 'card' } })
                    } else {
                      setFormData({
                        ...formData,
                        source: { type: 'savings', savingsAccountId: e.target.value },
                      })
                    }
                  }}
                >
                  <option value="card">{t('budget.fromCard')}</option>
                  {budget.savingsAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </NativeSelectField>
              </NativeSelectRoot>
            </Field.Root>
            <HStack>
              <Button onClick={handleAdd} className="bg-blue-600 text-white">
                {t('common.save')}
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline">
                {t('common.cancel')}
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}

      {budget.plannedExpenses.length === 0 && !isAdding && (
        <Text className="text-gray-500">{t('budget.noPlannedExpenses')}</Text>
      )}

      <VStack gap={2} align="stretch">
        {budget.plannedExpenses.map((expense) => (
          <Box key={expense.id} p={4} className="bg-gray-50 rounded-lg">
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <Text className="font-medium">{expense.name}</Text>
                <Text className="text-sm text-gray-600">
                  {formatCurrency(expense.amount)} • {expense.date.toLocaleDateString('ru-RU')} • {getSourceLabel(expense)}
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

