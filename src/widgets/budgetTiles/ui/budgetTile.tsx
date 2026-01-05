import { Box, Card, Text, VStack, HStack, Progress } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { CATEGORIES } from '@/entities/category'
import { formatCurrency } from '@/shared/lib/formatters'
import type { BudgetStatus } from '@/entities/budget'

type Props = {
  status: BudgetStatus
}

export const BudgetTile = ({ status }: Props) => {
  const { t, i18n } = useTranslation()
  const category = CATEGORIES.find(c => c.id === status.categoryId)
  
  const spendingRate = status.limit > 0 ? (status.spent / status.limit) * 100 : 0
  const forecastRate = status.limit > 0 ? (status.forecast / status.limit) * 100 : 0
  
  const getColorScheme = () => {
    if (status.isOverspent) return 'red'
    if (status.willOverspend) return 'orange'
    if (spendingRate > 80) return 'yellow'
    return 'green'
  }

  return (
    <Card.Root>
      <Card.Body>
        <VStack align="stretch" gap={3}>
          <HStack justify="space-between">
            <HStack>
              <Box 
                w={3} 
                h={3} 
                borderRadius="full" 
                bg={category?.color || 'gray.500'}
              />
              <Text fontWeight="bold" fontSize="sm">
                {i18n.language === 'ru' ? category?.name : category?.nameEn}
              </Text>
            </HStack>
            {status.isOverspent && (
              <Text fontSize="xs" color="red.600" fontWeight="bold">
                {t('budget.overspent', 'Over budget')}
              </Text>
            )}
          </HStack>

          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" color="gray.600">
                {t('budget.spent', 'Spent')}
              </Text>
              <Text fontSize="sm" fontWeight="bold">
                {formatCurrency(status.spent)} / {formatCurrency(status.limit)}
              </Text>
            </HStack>
            <Progress.Root 
              value={spendingRate} 
              colorPalette={getColorScheme()}
              size="sm"
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </Box>

          <HStack justify="space-between" fontSize="xs">
            <Text color="gray.600">
              {t('budget.remaining', 'Remaining')}: {formatCurrency(status.remaining)}
            </Text>
            <Text color="gray.600">
              {t('budget.daysLeft', '{{days}} days left', { days: status.daysRemaining })}
            </Text>
          </HStack>

          {status.willOverspend && !status.isOverspent && (
            <Box bg="orange.50" p={2} borderRadius="md">
              <Text fontSize="xs" color="orange.700">
                {t('budget.willOverspend', 
                  'Forecast: {{amount}} ({{percent}}%)', 
                  { 
                    amount: formatCurrency(status.forecast),
                    percent: Math.round(forecastRate)
                  }
                )}
              </Text>
            </Box>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}
