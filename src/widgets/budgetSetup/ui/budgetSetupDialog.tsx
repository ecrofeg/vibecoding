import { useState, useEffect } from 'react'
import { 
  Dialog, 
  Button, 
  VStack, 
  Text,
  Field,
  Input,
  Select,
  HStack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSetAtom, useAtomValue } from 'jotai'
import { v4 as uuidv4 } from 'uuid'
import { saveBudgetToDB, budgetsAtom, getCurrentPeriod, getBudgetForPeriodAndCategory } from '@/entities/budget'
import { CATEGORIES } from '@/entities/category'
import type { Budget } from '@/shared/types'

type Props = {
  open: boolean
  onClose: () => void
}

export const BudgetSetupDialog = ({ open, onClose }: Props) => {
  const { t, i18n } = useTranslation()
  const saveBudget = useSetAtom(saveBudgetToDB)
  const getBudget = useAtomValue(getBudgetForPeriodAndCategory)
  const currentPeriod = getCurrentPeriod()
  
  const [categoryId, setCategoryId] = useState<string>(CATEGORIES[0].id)
  const [amount, setAmount] = useState<string>('')
  const [period, setPeriod] = useState<string>(currentPeriod)

  useEffect(() => {
    if (open) {
      const existing = getBudget(period, categoryId)
      if (existing) {
        setAmount(existing.limitAmount.toString())
      } else {
        setAmount('')
      }
    }
  }, [open, period, categoryId, getBudget])

  const handleSave = async () => {
    const limitAmount = parseFloat(amount)
    if (isNaN(limitAmount) || limitAmount <= 0) {
      alert(t('budget.invalidAmount', 'Please enter a valid amount'))
      return
    }

    const existing = getBudget(period, categoryId)
    
    const budget: Budget = {
      id: existing?.id || uuidv4(),
      period,
      categoryId,
      limitAmount,
      currency: 'RUB',
    }

    await saveBudget(budget)
    onClose()
  }

  const generatePeriodOptions = () => {
    const options = []
    const current = new Date()
    
    for (let i = -2; i <= 3; i++) {
      const date = new Date(current.getFullYear(), current.getMonth() + i, 1)
      const periodStr = date.toISOString().slice(0, 7)
      const label = date.toLocaleDateString(i18n.language, { 
        year: 'numeric', 
        month: 'long' 
      })
      options.push({ value: periodStr, label })
    }
    
    return options
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>
              {t('budget.setup', 'Set up budget')}
            </Dialog.Title>
          </Dialog.Header>
          
          <Dialog.Body>
            <VStack gap={4} align="stretch">
              <Field label={t('budget.period', 'Period')}>
                <Select.Root
                  value={[period]}
                  onValueChange={(e) => setPeriod(e.value[0])}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder={t('budget.selectPeriod', 'Select period')} />
                  </Select.Trigger>
                  <Select.Content>
                    {generatePeriodOptions().map(opt => (
                      <Select.Item key={opt.value} item={opt.value}>
                        {opt.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Field>

              <Field label={t('budget.category', 'Category')}>
                <Select.Root
                  value={[categoryId]}
                  onValueChange={(e) => setCategoryId(e.value[0])}
                >
                  <Select.Trigger>
                    <Select.ValueText placeholder={t('budget.selectCategory', 'Select category')} />
                  </Select.Trigger>
                  <Select.Content>
                    {CATEGORIES.map(cat => (
                      <Select.Item key={cat.id} item={cat.id}>
                        <HStack>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{i18n.language === 'ru' ? cat.name : cat.nameEn}</span>
                        </HStack>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Field>

              <Field label={t('budget.limit', 'Budget limit')}>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                />
              </Field>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Button variant="outline" onClick={onClose}>
                {t('budget.cancel', 'Cancel')}
              </Button>
            </Dialog.CloseTrigger>
            <Button colorPalette="blue" onClick={handleSave}>
              {t('budget.save', 'Save')}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
