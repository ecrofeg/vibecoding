import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'
import { ResponsiveBar } from '@nivo/bar'
import { transactionsAtom } from '@/entities/transaction'
import { CATEGORIES } from '@/entities/category'
import { formatDateShort } from '@/shared/lib/formatters'
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { Box, VStack, Heading } from '@chakra-ui/react'
import { useMemo } from 'react'

type Props = {
  className?: string
  months?: number
}

export const TrendChart = ({ className, months = 6 }: Props) => {
  const { t, i18n } = useTranslation()
  const transactions = useAtomValue(transactionsAtom)

  const { chartData, categoryKeys } = useMemo(() => {
    const endDate = endOfMonth(new Date())
    const startDate = startOfMonth(subMonths(endDate, months - 1))
    const monthRanges = eachMonthOfInterval({ start: startDate, end: endDate })

    const expenses = transactions.filter(tx => tx.txType === 'expense' && !tx.isTransfer)
    
    const allCategoryTotals = new Map<string, number>()
    for (const tx of expenses) {
      const categoryId = tx.categoryId || 'other'
      const current = allCategoryTotals.get(categoryId) || 0
      allCategoryTotals.set(categoryId, current + Math.abs(tx.amount))
    }

    const sortedCategories = Array.from(allCategoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([catId]) => catId)

    const data = monthRanges.map(monthStart => {
      const monthEnd = endOfMonth(monthStart)
      const monthTransactions = expenses.filter(tx => {
        const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date)
        if (!txDate || isNaN(txDate.getTime())) {
          return false
        }
        return txDate >= monthStart && txDate <= monthEnd
      })

      const categoryTotals = new Map<string, number>()
      
      for (const tx of monthTransactions) {
        const categoryId = tx.categoryId || 'other'
        const current = categoryTotals.get(categoryId) || 0
        categoryTotals.set(categoryId, current + Math.abs(tx.amount))
      }

      const result: Record<string, string | number> = {
        month: formatDateShort(monthStart, i18n.language),
      }

      for (const catId of sortedCategories) {
        result[catId] = Math.round((categoryTotals.get(catId) || 0) * 100) / 100
      }

      return result
    })

    return { chartData: data, categoryKeys: sortedCategories }
  }, [transactions, months, i18n.language])

  if (chartData.length === 0) {
    return (
      <Box className={className}>
        <VStack gap={4}>
          <Heading size="lg">{t('trendChart.title')}</Heading>
          <p className="text-gray-500">{t('trendChart.empty')}</p>
        </VStack>
      </Box>
    )
  }

  const getCategoryColor = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    return category?.color || '#607D8B'
  }

  const getCategoryLabel = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId)
    return category ? (i18n.language === 'ru' ? category.name : category.nameEn) : 'Unknown'
  }

  return (
    <Box className={className}>
      <VStack gap={4} align="stretch">
        <Heading size="lg">{t('trendChart.titleWithMonths', { months })}</Heading>
        <div className="h-96 w-full">
          <ResponsiveBar
            data={chartData}
            keys={categoryKeys}
            indexBy="month"
            margin={{ top: 50, right: 160, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={(d) => getCategoryColor(String(d.id))}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              format: (value) => `${value.toLocaleString('ru-RU')} ₽`,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
              from: 'color',
              modifiers: [['darker', 1.6]],
            }}
            legends={[
              {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 150,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 130,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                data: categoryKeys.map(catId => ({
                  id: catId,
                  label: getCategoryLabel(catId),
                  color: getCategoryColor(catId),
                })),
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemOpacity: 1,
                    },
                  },
                ],
              },
            ]}
          />
        </div>
      </VStack>
    </Box>
  )
}

