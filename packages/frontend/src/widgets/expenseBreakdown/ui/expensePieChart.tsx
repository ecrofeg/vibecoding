import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { ResponsivePie } from '@nivo/pie'
import { BasicTooltip } from '@nivo/tooltip'
import { expensesAtom } from '@/entities/transaction'
import { useMemo, useState } from 'react'
import { HStack, Button } from '@chakra-ui/react'

type ChartDatum = {
  id: string
  label: string
  value: number
  color: string
}

const colors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#7CB342', '#00BCD4', '#E91E63', '#673AB7',
  '#3F51B5', '#009688', '#FFC107', '#795548', '#607D8B',
]

type Props = {
  className?: string
}

export const ExpensePieChart = ({ className }: Props) => {
  const { t } = useTranslation()
  const [expenses] = useAtom(expensesAtom)
  const [breakdownMode, setBreakdownMode] = useState<'name' | 'category'>('name')

  const chartData = useMemo(() => {
    const totals = new Map<string, number>()

    for (const expense of expenses) {
      let key: string
      if (breakdownMode === 'name') {
        key = expense.name || 'Unknown'
      } else {
        key = expense.category || 'other'
      }
      const current = totals.get(key) || 0
      totals.set(key, current + Math.abs(expense.amount))
    }

    const sortedData = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])

    const threshold = 500
    const mainItems: Array<[string, number]> = []
    let otherTotal = 0

    for (const [key, value] of sortedData) {
      if (value < threshold) {
        otherTotal += value
      } else {
        mainItems.push([key, value])
      }
    }

    const result = mainItems.map(([key, value], index) => {
      let label: string
      if (breakdownMode === 'name') {
        label = key
      } else {
        const categoryKey = `categories.${key}` as const
        label = t(categoryKey) || key
      }
      return {
        id: key,
        label,
        value: Math.round(value * 100) / 100,
        color: colors[index % colors.length],
      }
    })

    if (otherTotal > 0) {
      result.push({
        id: 'Other',
        label: t('expensePieChart.other'),
        value: Math.round(otherTotal * 100) / 100,
        color: colors[mainItems.length % colors.length],
      })
    }

    return result
  }, [expenses, breakdownMode, t])

  if (chartData.length === 0) {
    return (
      <div className={`h-96 w-full flex items-center justify-center ${className || ''}`}>
        <p className="text-gray-500">{t('expensePieChart.empty')}</p>
      </div>
    )
  }

  return (
    <div className={`w-full ${className || ''}`}>
      <HStack gap={2} mb={4} justify="center">
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
        <ResponsivePie<ChartDatum>
          data={chartData}
          margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          colors={(d) => d.data.color}
          borderWidth={1}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 0.2]],
          }}
          arcLinkLabel="label"
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: 'color',
            modifiers: [['darker', 2]],
          }}
          tooltip={({ datum }) => (
            <BasicTooltip
              id={datum.data.label}
              value={datum.formattedValue}
              color={datum.color}
            />
          )}
        />
      </div>
    </div>
  )
}

