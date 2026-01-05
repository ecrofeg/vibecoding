import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { ResponsiveBar } from '@nivo/bar'
import { transactionsAtom } from '@/entities/transaction'
import { formatDateShort } from '@/shared/lib/formatters'
import { startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns'
import { Box, VStack, Heading } from '@chakra-ui/react'
import { useMemo } from 'react'

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
  const [transactions] = useAtom(transactionsAtom)

  const { chartData, topNames } = useMemo(() => {
    const endDate = endOfMonth(new Date())
    const startDate = startOfMonth(subMonths(endDate, months - 1))
    const monthRanges = eachMonthOfInterval({ start: startDate, end: endDate })

    const allNameTotals = new Map<string, number>()
    for (const tx of transactions) {
      if (tx.amount < 0) {
        const current = allNameTotals.get(tx.name) || 0
        allNameTotals.set(tx.name, current + Math.abs(tx.amount))
      }
    }

    const sortedNames = Array.from(allNameTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name)

    const data = monthRanges.map(monthStart => {
      const monthEnd = endOfMonth(monthStart)
      const monthTransactions = transactions.filter(tx => {
        if (!tx.date || isNaN(tx.date.getTime())) {
          return false
        }
        return tx.date >= monthStart && tx.date <= monthEnd && tx.amount < 0
      })

      const nameTotals = new Map<string, number>()
      
      for (const tx of monthTransactions) {
        const current = nameTotals.get(tx.name) || 0
        nameTotals.set(tx.name, current + Math.abs(tx.amount))
      }

      const result: Record<string, string | number> = {
        month: formatDateShort(monthStart, i18n.language),
      }

      for (const name of sortedNames) {
        result[name] = Math.round((nameTotals.get(name) || 0) * 100) / 100
      }

      return result
    })

    return { chartData: data, topNames: sortedNames }
  }, [transactions, months])

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
        <div className="h-96 w-full">
          <ResponsiveBar
            data={chartData}
            keys={topNames}
            indexBy="month"
            margin={{ top: 50, right: 160, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={(d) => {
              const index = topNames.indexOf(String(d.id))
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

