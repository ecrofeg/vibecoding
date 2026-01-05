import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'
import { ResponsivePie } from '@nivo/pie'
import { expensesAtom } from '@/entities/transaction'
import { CATEGORIES } from '@/entities/category'
import { useMemo } from 'react'

type Props = {
  className?: string
}

export const ExpensePieChart = ({ className }: Props) => {
  const { t, i18n } = useTranslation()
  const expenses = useAtomValue(expensesAtom)

  const chartData = useMemo(() => {
    const categoryTotals = new Map<string, number>()

    for (const expense of expenses) {
      const categoryId = expense.categoryId || 'other'
      const current = categoryTotals.get(categoryId) || 0
      categoryTotals.set(categoryId, current + Math.abs(expense.amount))
    }

    const result = Array.from(categoryTotals.entries())
      .map(([categoryId, value]) => {
        const category = CATEGORIES.find(c => c.id === categoryId)
        return {
          id: categoryId,
          label: i18n.language === 'ru' ? (category?.name || 'Unknown') : (category?.nameEn || 'Unknown'),
          value: Math.round(value * 100) / 100,
          color: category?.color || '#607D8B',
        }
      })
      .sort((a, b) => b.value - a.value)

    return result
  }, [expenses, i18n.language])

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

