import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, subWeeks, subYears } from 'date-fns'
import { dateFilterAtom } from '@/entities/transaction'
import { Button, HStack, Box } from '@chakra-ui/react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './datepicker.css'
import type { DateFilter } from '@/shared/types'

type Props = {
  className?: string
}

const isValidDate = (date: Date | null | undefined): boolean => {
  return date !== null && date !== undefined && !isNaN(date.getTime())
}

export const DateRangePicker = ({ className }: Props) => {
  const { t } = useTranslation()
  const [filter, setFilter] = useAtom(dateFilterAtom)

  useEffect(() => {
    if (!isValidDate(filter.startDate) || !isValidDate(filter.endDate)) {
      const now = new Date()
      setFilter({
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      })
    }
  }, [filter.startDate, filter.endDate, setFilter])

  const setQuickRange = (range: DateFilter) => {
    if (
      range.startDate &&
      !isNaN(range.startDate.getTime()) &&
      range.endDate &&
      !isNaN(range.endDate.getTime())
    ) {
      setFilter(range)
    }
  }

  const thisWeek = {
    startDate: startOfWeek(new Date()),
    endDate: endOfWeek(new Date()),
  }

  const lastWeek = {
    startDate: startOfWeek(subWeeks(new Date(), 1)),
    endDate: endOfWeek(subWeeks(new Date(), 1)),
  }

  const thisMonth = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  }

  const lastMonth = {
    startDate: startOfMonth(subMonths(new Date(), 1)),
    endDate: endOfMonth(subMonths(new Date(), 1)),
  }

  const last3Months = {
    startDate: startOfMonth(subMonths(new Date(), 3)),
    endDate: endOfMonth(new Date()),
  }

  const last6Months = {
    startDate: startOfMonth(subMonths(new Date(), 6)),
    endDate: endOfMonth(new Date()),
  }

  const lastYear = {
    startDate: startOfMonth(subYears(new Date(), 1)),
    endDate: endOfMonth(new Date()),
  }

  return (
    <Box className={className}>
      <HStack gap={2} flexWrap="wrap">
        <Button
          size="sm"
          colorPalette="blue"
          variant={
            isValidDate(filter.startDate) &&
            filter.startDate!.getTime() === thisWeek.startDate.getTime()
              ? 'solid'
              : 'outline'
          }
          onClick={() => setQuickRange(thisWeek)}
        >
          {t('dateRangePicker.thisWeek')}
        </Button>
        <Button
          size="sm"
          colorPalette="blue"
          variant={
            isValidDate(filter.startDate) &&
            filter.startDate!.getTime() === lastWeek.startDate.getTime()
              ? 'solid'
              : 'outline'
          }
          onClick={() => setQuickRange(lastWeek)}
        >
          {t('dateRangePicker.lastWeek')}
        </Button>
        <Button
          size="sm"
          colorPalette="blue"
          variant={
            isValidDate(filter.startDate) &&
            filter.startDate!.getTime() === thisMonth.startDate.getTime()
              ? 'solid'
              : 'outline'
          }
          onClick={() => setQuickRange(thisMonth)}
        >
          {t('dateRangePicker.thisMonth')}
        </Button>
        <Button
          size="sm"
          colorPalette="blue"
          variant={
            isValidDate(filter.startDate) &&
            filter.startDate!.getTime() === lastMonth.startDate.getTime()
              ? 'solid'
              : 'outline'
          }
          onClick={() => setQuickRange(lastMonth)}
        >
          {t('dateRangePicker.lastMonth')}
        </Button>
        <Button
          size="sm"
          colorPalette="blue"
          variant={
            isValidDate(filter.startDate) &&
            filter.startDate!.getTime() === last3Months.startDate.getTime()
              ? 'solid'
              : 'outline'
          }
          onClick={() => setQuickRange(last3Months)}
        >
          {t('dateRangePicker.last3Months')}
        </Button>
        <Button
          size="sm"
          colorPalette="blue"
          variant={
            isValidDate(filter.startDate) &&
            filter.startDate!.getTime() === last6Months.startDate.getTime()
              ? 'solid'
              : 'outline'
          }
          onClick={() => setQuickRange(last6Months)}
        >
          {t('dateRangePicker.last6Months')}
        </Button>
        <Button
          size="sm"
          colorPalette="blue"
          variant={
            isValidDate(filter.startDate) &&
            filter.startDate!.getTime() === lastYear.startDate.getTime()
              ? 'solid'
              : 'outline'
          }
          onClick={() => setQuickRange(lastYear)}
        >
          {t('dateRangePicker.lastYear')}
        </Button>
      </HStack>
      <HStack gap={2} mt={4} alignItems="center">
        <Box flex={1}>
          <DatePicker
            selected={isValidDate(filter.startDate) ? filter.startDate : null}
            onChange={(date: Date | null) => {
              if (date && !isNaN(date.getTime())) {
                setFilter({ ...filter, startDate: date })
              }
            }}
            selectsStart
            startDate={isValidDate(filter.startDate) ? filter.startDate : undefined}
            endDate={isValidDate(filter.endDate) ? filter.endDate : undefined}
            dateFormat="yyyy-MM-dd"
            placeholderText={t('dateRangePicker.startDate')}
          />
        </Box>
        <span className="text-gray-600">{t('dateRangePicker.to')}</span>
        <Box flex={1}>
          <DatePicker
            selected={isValidDate(filter.endDate) ? filter.endDate : null}
            onChange={(date: Date | null) => {
              if (date && !isNaN(date.getTime())) {
                setFilter({ ...filter, endDate: date })
              }
            }}
            selectsEnd
            startDate={isValidDate(filter.startDate) ? filter.startDate : undefined}
            endDate={isValidDate(filter.endDate) ? filter.endDate : undefined}
            minDate={isValidDate(filter.startDate) ? filter.startDate : undefined}
            dateFormat="yyyy-MM-dd"
            placeholderText={t('dateRangePicker.endDate')}
          />
        </Box>
      </HStack>
    </Box>
  )
}

