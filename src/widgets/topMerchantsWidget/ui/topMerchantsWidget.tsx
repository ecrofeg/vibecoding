import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Box, Card, Text, VStack, HStack, Heading } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { transactionsAtom } from '@/entities/transaction'
import { CATEGORIES } from '@/entities/category'
import { calculateTopMerchants } from '@/shared/lib/insights'
import { formatCurrency } from '@/shared/lib/formatters'

type Props = {
  className?: string
  period?: 'week' | 'month'
  limit?: number
}

export const TopMerchantsWidget = ({ className, period = 'month', limit = 10 }: Props) => {
  const { t, i18n } = useTranslation()
  const transactions = useAtomValue(transactionsAtom)

  const topMerchants = useMemo(() => {
    return calculateTopMerchants(transactions, period, limit)
  }, [transactions, period, limit])

  if (topMerchants.merchants.length === 0) {
    return null
  }

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return '#gray'
    const category = CATEGORIES.find(c => c.id === categoryId)
    return category?.color || '#gray'
  }

  return (
    <Box className={className}>
      <Card.Root>
        <Card.Body>
          <VStack align="stretch" gap={4}>
            <Heading size="md">
              {t('topMerchants.title', 'Top merchants')} ({period})
            </Heading>
            
            <VStack align="stretch" gap={2}>
              {topMerchants.merchants.map((merchant, index) => (
                <HStack key={merchant.merchantNorm} justify="space-between">
                  <HStack flex={1}>
                    <Text fontSize="sm" color="gray.500" minW="20px">
                      {index + 1}.
                    </Text>
                    <Box
                      w={2}
                      h={2}
                      borderRadius="full"
                      bg={getCategoryColor(merchant.categoryId)}
                    />
                    <VStack align="start" gap={0} flex={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {merchant.displayName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {t('topMerchants.transactions', '{{count}} transactions', { 
                          count: merchant.count 
                        })}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontWeight="bold" fontSize="sm">
                    {formatCurrency(merchant.total)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
