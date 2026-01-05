import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { ResponsivePie } from '@nivo/pie'
import { expensesAtom } from '@/entities/transaction'
import { useMemo } from 'react'

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

  const chartData = useMemo(() => {
    const nameTotals = new Map<string, number>()

    for (const expense of expenses) {
      const name = expense.name || 'Unknown'
      const current = nameTotals.get(name) || 0
      nameTotals.set(name, current + Math.abs(expense.amount))
    }

    const sortedData = Array.from(nameTotals.entries())
      .sort((a, b) => b[1] - a[1])

    const threshold = 500
    const mainCategories: Array<[string, number]> = []
    let otherTotal = 0

    for (const [name, value] of sortedData) {
      if (value < threshold) {
        otherTotal += value
      } else {
        mainCategories.push([name, value])
      }
    }

    const result = mainCategories.map(([name, value], index) => ({
      id: name,
      label: name,
      value: Math.round(value * 100) / 100,
      color: colors[index % colors.length],
    }))

    if (otherTotal > 0) {
      result.push({
        id: 'Other',
        label: t('expensePieChart.other'),
        value: Math.round(otherTotal * 100) / 100,
        color: colors[mainCategories.length % colors.length],
      })
    }

    return result
  }, [expenses])

  if (chartData.length === 0) {
    return (
      <div className={`h-96 w-full flex items-center justify-center ${className || ''}`}>
        <p className="text-gray-500">{t('expensePieChart.empty')}</p>
      </div>
    )
  }

  return (
    <div className={`h-96 w-full ${className || ''}`}>
      <ResponsivePie
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
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="#333333"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]],
        }}
      />
    </div>
  )
}

