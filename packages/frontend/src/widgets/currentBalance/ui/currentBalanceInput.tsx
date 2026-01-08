import { useAtom } from 'jotai'
import { budgetAtom } from '@/entities/budget'
import { VStack, Heading, Input, Field } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/lib/formatters'

export const CurrentBalanceInput = () => {
  const { t } = useTranslation()
  const [budget, setBudget] = useAtom(budgetAtom)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setBudget({
      ...budget,
      currentBalance: value,
    })
  }

  return (
    <VStack gap={4} align="stretch">
      <Heading size="lg" className="text-gray-700">
        {t('budget.currentBalance')}
      </Heading>
      <Field.Root>
        <Field.Label>{t('budget.currentBalanceLabel')}</Field.Label>
        <Input
          type="number"
          value={budget.currentBalance}
          onChange={handleChange}
          placeholder="0"
          className="text-lg"
        />
      </Field.Root>
      <div className="text-sm text-gray-600">
        {t('budget.currentBalanceValue')}: {formatCurrency(budget.currentBalance)}
      </div>
    </VStack>
  )
}

