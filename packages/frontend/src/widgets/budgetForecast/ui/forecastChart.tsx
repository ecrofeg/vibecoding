import { useAtom } from 'jotai'
import { budgetAtom, type ForecastHorizon } from '@/entities/budget'
import { VStack, Heading, HStack, Text, Box, NativeSelectRoot, NativeSelectField, Field } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatCurrency, formatCurrencyPrecise, formatCompactNumber } from '@/shared/lib/formatters'
import { useState, useMemo } from 'react'
import { ResponsiveLine, type SliceTooltipProps } from '@nivo/line'
import { calculateForecast } from '../lib/forecastCalculator'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const horizonOptions: { value: ForecastHorizon; label: string }[] = [
  { value: '1m', label: '1 месяц' },
  { value: '3m', label: '3 месяца' },
  { value: '6m', label: '6 месяцев' },
  { value: '1y', label: '1 год' },
]

export const ForecastChart = () => {
  const { t } = useTranslation()
  const [budget] = useAtom(budgetAtom)
  const [horizon, setHorizon] = useState<ForecastHorizon>('3m')

  const { points, totalIncome, totalExpenses } = useMemo(
    () => calculateForecast(budget, horizon),
    [budget, horizon]
  )

  // Функция для получения перевода по ID серии (должна быть объявлена до использования)
  const getSerieLabel = (id: string | number): string => {
    const idStr = String(id)
    // Проверяем если это уже переведенная строка
    if (idStr === t('budget.cardBalance') || idStr === t('budget.savingsBalance') || idStr === t('budget.totalBalance')) {
      return idStr
    }
    // Иначе переводим из ключа
    switch (idStr) {
      case 'cardBalance':
        return t('budget.cardBalance')
      case 'savingsBalance':
        return t('budget.savingsBalance')
      case 'totalBalance':
        return t('budget.totalBalance')
      default:
        return idStr
    }
  }

  const chartData = useMemo(() => [
    {
      id: getSerieLabel('cardBalance'),
      data: points.map((p) => ({
        x: p.date.toISOString().split('T')[0],
        y: p.cardBalance,
        date: p.date,
      })),
    },
    {
      id: getSerieLabel('savingsBalance'),
      data: points.map((p) => ({
        x: p.date.toISOString().split('T')[0],
        y: p.savingsBalance,
        date: p.date,
      })),
    },
    {
      id: getSerieLabel('totalBalance'),
      data: points.map((p) => ({
        x: p.date.toISOString().split('T')[0],
        y: p.totalBalance,
        date: p.date,
      })),
    },
  ], [points, t])

  const horizonLabel = horizonOptions.find(opt => opt.value === horizon)?.label || horizon

  // Кастомный тултип
  const CustomTooltip = ({ slice }: SliceTooltipProps) => {
    const point = slice.points[0]
    const date = (point.data as any).date as Date
    const formattedDate = format(date, 'd MMMM yyyy', { locale: ru })

    return (
      <div
        style={{
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          minWidth: '250px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
          {formattedDate}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {slice.points.map((p) => {
            // Правильные поля - seriesId и seriesColor (с буквой s в конце)
            const seriesId = (p as any).seriesId
            const seriesColor = (p as any).seriesColor
            const label = getSerieLabel(seriesId)
            return (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: seriesColor,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151', whiteSpace: 'nowrap' }}>
                    {label}
                  </span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>
                  {formatCurrencyPrecise(p.data.y as number)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <VStack gap={4} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg" className="text-gray-700">
          {t('budget.forecast')}
        </Heading>
        <Field.Root width="200px">
          <Field.Label>{t('budget.horizon')}</Field.Label>
          <NativeSelectRoot>
            <NativeSelectField
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as ForecastHorizon)}
            >
              {horizonOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </Field.Root>
      </HStack>

      {points.length > 0 ? (
        <>
          <Box height="400px" width="100%">
            <ResponsiveLine
              data={chartData}
              margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
              xScale={{ type: 'time', format: '%Y-%m-%d', useUTC: false }}
              xFormat="time:%Y-%m-%d"
              yScale={{ type: 'linear', min: 'auto' }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                format: '%b %d',
                tickValues: 'every 2 weeks',
                legend: t('budget.date'),
                legendOffset: 36,
                legendPosition: 'middle',
              }}
              axisLeft={{
                legend: t('budget.amount'),
                legendOffset: -40,
                legendPosition: 'middle',
                format: (value) => formatCompactNumber(value),
              }}
              pointSize={0}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              useMesh={true}
              enableSlices="x"
              sliceTooltip={CustomTooltip}
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  itemOpacity: 0.75,
                  symbolSize: 12,
                  symbolShape: 'circle',
                },
              ]}
              colors={{ scheme: 'category10' }}
            />
          </Box>

          <HStack gap={4} justify="center">
            <Box p={4} className="bg-green-50 rounded-lg">
              <VStack gap={1}>
                <Text className="text-sm text-gray-600">{t('budget.totalIncome')}</Text>
                <Text className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</Text>
              </VStack>
            </Box>
            <Box p={4} className="bg-red-50 rounded-lg">
              <VStack gap={1}>
                <Text className="text-sm text-gray-600">{t('budget.totalExpenses')}</Text>
                <Text className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</Text>
              </VStack>
            </Box>
            <Box p={4} className="bg-blue-50 rounded-lg">
              <VStack gap={1}>
                <Text className="text-sm text-gray-600">{t('budget.netChange')}</Text>
                <Text
                  className={`text-xl font-bold ${
                    totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(totalIncome - totalExpenses)}
                </Text>
              </VStack>
            </Box>
          </HStack>
        </>
      ) : (
        <Text className="text-gray-500">{t('budget.noForecastData')}</Text>
      )}
    </VStack>
  )
}

