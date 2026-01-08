import { useState } from 'react'
import { Box, Input, Field, Button, HStack, VStack, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import '@/widgets/dateRangeFilter/ui/datepicker.css'
import type { RecurrencePeriod, IncomeDestination, ExpenseSource } from '@/entities/budget'
import type { SavingsAccount } from '@/entities/budget'

type RecurringItemFormData = {
  name: string
  amount: string
  period: RecurrencePeriod
  dayOfMonth?: string
  dayOfWeek?: string
  destination?: IncomeDestination
  source?: ExpenseSource
}

type Props = {
  initialData?: Partial<RecurringItemFormData>
  savingsAccounts: SavingsAccount[]
  isIncome?: boolean
  onSubmit: (data: RecurringItemFormData) => void
  onCancel: () => void
}

export const RecurringItemForm = ({ initialData, savingsAccounts, isIncome = false, onSubmit, onCancel }: Props) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<RecurringItemFormData>({
    name: initialData?.name || '',
    amount: initialData?.amount || '',
    period: initialData?.period || 'monthly',
    dayOfMonth: initialData?.dayOfMonth?.toString() || '',
    dayOfWeek: initialData?.dayOfWeek?.toString() || '',
    destination: initialData?.destination || (isIncome ? { type: 'card' } : undefined),
    source: initialData?.source || (!isIncome ? { type: 'card' } : undefined),
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.amount) return

    const submitData: RecurringItemFormData = {
      ...formData,
      dayOfMonth: formData.period === 'monthly_on_day' ? formData.dayOfMonth : undefined,
      dayOfWeek: formData.period === 'weekly' ? formData.dayOfWeek : undefined,
    }

    onSubmit(submitData)
  }

  return (
    <Box p={4} className="bg-gray-50 rounded-lg">
      <VStack gap={4} align="stretch">
        <Field.Root>
          <Field.Label>{t('budget.itemName')}</Field.Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={t('budget.itemNamePlaceholder')}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>{t('budget.itemAmount')}</Field.Label>
          <Input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0"
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>{t('budget.period')}</Field.Label>
          <NativeSelectRoot>
            <NativeSelectField
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value as RecurrencePeriod })}
            >
              <option value="weekly">{t('budget.weekly')}</option>
              <option value="monthly">{t('budget.monthly')}</option>
              <option value="monthly_on_day">{t('budget.monthlyOnDay')}</option>
            </NativeSelectField>
          </NativeSelectRoot>
        </Field.Root>
        {formData.period === 'weekly' && (
          <Field.Root>
            <Field.Label>{t('budget.dayOfWeek')}</Field.Label>
            <NativeSelectRoot>
              <NativeSelectField
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              >
                <option value="0">{t('budget.sunday')}</option>
                <option value="1">{t('budget.monday')}</option>
                <option value="2">{t('budget.tuesday')}</option>
                <option value="3">{t('budget.wednesday')}</option>
                <option value="4">{t('budget.thursday')}</option>
                <option value="5">{t('budget.friday')}</option>
                <option value="6">{t('budget.saturday')}</option>
              </NativeSelectField>
            </NativeSelectRoot>
          </Field.Root>
        )}
        {formData.period === 'monthly_on_day' && (
          <Field.Root>
            <Field.Label>{t('budget.dayOfMonth')}</Field.Label>
            <DatePicker
              selected={
                formData.dayOfMonth
                  ? new Date(2024, 0, parseInt(formData.dayOfMonth))
                  : null
              }
              onChange={(date: Date | null) => {
                if (date) {
                  setFormData({ ...formData, dayOfMonth: date.getDate().toString() })
                }
              }}
              dateFormat="dd"
              placeholderText={t('budget.dayOfMonth')}
              showMonthYearPicker={false}
              minDate={new Date(2024, 0, 1)}
              maxDate={new Date(2024, 0, 31)}
            />
          </Field.Root>
        )}
        {isIncome && (
          <Field.Root>
            <Field.Label>{t('budget.destination')}</Field.Label>
            <NativeSelectRoot>
              <NativeSelectField
                value={formData.destination?.type === 'savings' ? formData.destination.savingsAccountId : 'card'}
                onChange={(e) => {
                  if (e.target.value === 'card') {
                    setFormData({ ...formData, destination: { type: 'card' } })
                  } else {
                    setFormData({
                      ...formData,
                      destination: { type: 'savings', savingsAccountId: e.target.value },
                    })
                  }
                }}
              >
                <option value="card">{t('budget.toCard')}</option>
                {savingsAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field.Root>
        )}
        {!isIncome && (
          <Field.Root>
            <Field.Label>{t('budget.source')}</Field.Label>
            <NativeSelectRoot>
              <NativeSelectField
                value={formData.source?.type === 'savings' ? formData.source.savingsAccountId : 'card'}
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
                {savingsAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </NativeSelectField>
            </NativeSelectRoot>
          </Field.Root>
        )}
        <HStack>
          <Button onClick={handleSubmit} className="bg-blue-600 text-white">
            {t('common.save')}
          </Button>
          <Button onClick={onCancel} variant="outline">
            {t('common.cancel')}
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}

