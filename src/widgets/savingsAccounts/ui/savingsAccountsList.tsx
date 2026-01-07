import { useAtom } from 'jotai'
import { budgetAtom, type SavingsAccount } from '@/entities/budget'
import { VStack, Heading, Button, HStack, Text, Box, Input, Field } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/lib/formatters'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export const SavingsAccountsList = () => {
  const { t } = useTranslation()
  const [budget, setBudget] = useAtom(budgetAtom)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    annualInterestRate: '',
  })

  const handleAdd = () => {
    if (!formData.name || !formData.amount) return

    const newAccount: SavingsAccount = {
      id: uuidv4(),
      name: formData.name,
      amount: parseFloat(formData.amount) || 0,
      annualInterestRate: parseFloat(formData.annualInterestRate) || 0,
    }

    setBudget({
      ...budget,
      savingsAccounts: [...budget.savingsAccounts, newAccount],
    })

    setFormData({ name: '', amount: '', annualInterestRate: '' })
    setIsAdding(false)
  }

  const handleDelete = (id: string) => {
    setBudget({
      ...budget,
      savingsAccounts: budget.savingsAccounts.filter(acc => acc.id !== id),
    })
  }

  return (
    <VStack gap={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" className="text-gray-700">
          {t('budget.savingsAccounts')}
        </Heading>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white">
            {t('budget.addSavingsAccount')}
          </Button>
        )}
      </HStack>

      {isAdding && (
        <Box p={4} className="bg-gray-50 rounded-lg">
          <VStack gap={4} align="stretch">
            <Field.Root>
              <Field.Label>{t('budget.accountName')}</Field.Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('budget.accountNamePlaceholder')}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t('budget.accountAmount')}</Field.Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>{t('budget.annualInterestRate')}</Field.Label>
              <Input
                type="number"
                value={formData.annualInterestRate}
                onChange={(e) => setFormData({ ...formData, annualInterestRate: e.target.value })}
                placeholder="0"
              />
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

      {budget.savingsAccounts.length === 0 && !isAdding && (
        <Text className="text-gray-500">{t('budget.noSavingsAccounts')}</Text>
      )}

      <VStack gap={2} align="stretch">
        {budget.savingsAccounts.map((account) => (
          <Box key={account.id} p={4} className="bg-gray-50 rounded-lg">
            <HStack justify="space-between">
              <VStack align="start" gap={1}>
                <Text className="font-medium">{account.name}</Text>
                <Text className="text-sm text-gray-600">
                  {formatCurrency(account.amount)} • {account.annualInterestRate}% {t('budget.annual')}
                </Text>
              </VStack>
              <Button
                onClick={() => handleDelete(account.id)}
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

