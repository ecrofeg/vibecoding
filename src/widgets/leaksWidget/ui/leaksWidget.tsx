import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Box, Card, Text, VStack, HStack, Heading } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { transactionsAtom } from '@/entities/transaction'
import { calculateLeaks } from '@/shared/lib/insights'
import { formatCurrency } from '@/shared/lib/formatters'

type Props = {
  className?: string
  period?: 'week' | 'month'
  threshold?: number
}

export const LeaksWidget = ({ className, period = 'week', threshold = 800 }: Props) => {
  const { t } = useTranslation()
  const transactions = useAtomValue(transactionsAtom)

  const leaks = useMemo(() => {
    return calculateLeaks(transactions, period, threshold)
  }, [transactions, period, threshold])

  if (leaks.count === 0) {
    return null
  }

  return (
    <Box className={className}>
      <Card.Root>
        <Card.Body>
          <VStack align="stretch" gap={4}>
            <Heading size="md">
              {t('leaks.title', 'Small expenses')} ({period})
            </Heading>
            
            <HStack justify="space-between">
              <Text color="gray.600">
                {t('leaks.count', '{{count}} transactions', { count: leaks.count })}
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="orange.600">
                {formatCurrency(leaks.total)}
              </Text>
            </HStack>

            {leaks.topMerchants.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  {t('leaks.topMerchants', 'Top merchants')}:
                </Text>
                <VStack align="stretch" gap={1}>
                  {leaks.topMerchants.map(merchant => (
                    <HStack key={merchant.merchant} justify="space-between" fontSize="sm">
                      <Text color="gray.700">
                        {merchant.merchant} ({merchant.count})
                      </Text>
                      <Text fontWeight="medium">
                        {formatCurrency(merchant.total)}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            <Text fontSize="xs" color="gray.500">
              {t('leaks.threshold', 'Transactions under {{amount}}', { 
                amount: formatCurrency(threshold) 
              })}
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
