import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { ResponsiveBar } from '@nivo/bar'
import { expensesAtom } from '@/entities/transaction'
import { formatDateShort } from '@/shared/lib/formatters'
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { Box, VStack, Heading, HStack, Button } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

const colors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#7CB342', '#00BCD4', '#E91E63', '#673AB7',
  '#3F51B5', '#009688', '#FFC107', '#795548', '#607D8B',
]

type Props = {
  className?: string
  months?: number
}

export const TrendChart = ({ className, months = 6 }: Props) => {
  const { t, i18n } = useTranslation()
  const [expenses] = useAtom(expensesAtom)
  const [breakdownMode, setBreakdownMode] = useState<'name' | 'category'>('name')

  const { chartData, topKeys, keyLabels } = useMemo(() => {
    const endDate = endOfMonth(new Date())
    const startDate = startOfMonth(subMonths(endDate, months - 1))
    const monthRanges = eachMonthOfInterval({ start: startDate, end: endDate })

    const allKeyTotals = new Map<string, number>()
    for (const tx of expenses) {
      const key = breakdownMode === 'name' ? (tx.name || 'Unknown') : (tx.category || 'other')
      const current = allKeyTotals.get(key) || 0
      allKeyTotals.set(key, current + Math.abs(tx.amount))
    }

    const sortedKeys = Array.from(allKeyTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key]) => key)

    const labels = new Map<string, string>()
    for (const key of sortedKeys) {
      if (breakdownMode === 'name') {
        labels.set(key, key)
      } else {
        console.log(key)
        const categoryKey = `categories.${key}` as const
        labels.set(key, t(categoryKey) || key)
      }
    }

    const data = monthRanges.map(monthStart => {
      const monthEnd = endOfMonth(monthStart)
      const monthTransactions = expenses.filter(tx => {
        if (!tx.date || isNaN(tx.date.getTime())) {
          return false
        }
        return tx.date >= monthStart && tx.date <= monthEnd
      })

      const keyTotals = new Map<string, number>()
      
      for (const tx of monthTransactions) {
        const key = breakdownMode === 'name' ? (tx.name || 'Unknown') : (tx.category || 'other')
        const current = keyTotals.get(key) || 0
        keyTotals.set(key, current + Math.abs(tx.amount))
      }

      const result: Record<string, string | number> = {
        month: formatDateShort(monthStart, i18n.language),
      }

      for (const key of sortedKeys) {
        result[key] = Math.round((keyTotals.get(key) || 0) * 100) / 100
      }

      return result
    })

    return { chartData: data, topKeys: sortedKeys, keyLabels: labels }
  }, [expenses, months, i18n.language, breakdownMode, t])

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

  return (
    <Box className={className}>
      <VStack gap={4} align="stretch">
        <Heading size="lg">{t('trendChart.titleWithMonths', { months })}</Heading>
        <HStack gap={2} justify="center">
          <Button
            size="sm"
            variant={breakdownMode === 'name' ? 'solid' : 'outline'}
            colorPalette="blue"
            onClick={() => setBreakdownMode('name')}
          >
            {t('breakdownMode.byName')}
          </Button>
          <Button
            size="sm"
            variant={breakdownMode === 'category' ? 'solid' : 'outline'}
            colorPalette="blue"
            onClick={() => setBreakdownMode('category')}
          >
            {t('breakdownMode.byCategory')}
          </Button>
        </HStack>
        <div className="h-96 w-full">
          <ResponsiveBar
            data={chartData}
            keys={topKeys}
            indexBy="month"
            margin={{ top: 50, right: 160, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={(d) => {
              const index = topKeys.indexOf(String(d.id))
              return colors[index % colors.length]
            }}
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
            tooltipLabel={(d) => keyLabels.get(String(d.id)) || String(d.id)}
            legends={[
              {
                dataFrom: 'keys',
                data: topKeys.map((key, index) => ({
                  id: key,
                  label: keyLabels.get(key) || key,
                  color: colors[index % colors.length],
                })),
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

