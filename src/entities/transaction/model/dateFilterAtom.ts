import { atomWithStorage } from 'jotai/utils'
import { startOfMonth, endOfMonth } from 'date-fns'
import type { DateFilter } from '@/shared/types'

type StoredDateFilter = {
  startDate: string
  endDate: string
}

const now = new Date()
const defaultFilter: DateFilter = {
  startDate: startOfMonth(now),
  endDate: endOfMonth(now),
}

const storage = {
  getItem: (key: string): DateFilter => {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultFilter
      const parsed = JSON.parse(item) as StoredDateFilter
      const startDate = new Date(parsed.startDate)
      const endDate = new Date(parsed.endDate)
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return defaultFilter
      }
      return { startDate, endDate }
    } catch {
      return defaultFilter
    }
  },
  setItem: (key: string, value: DateFilter): void => {
    const stored: StoredDateFilter = {
      startDate: value.startDate.toISOString(),
      endDate: value.endDate.toISOString(),
    }
    localStorage.setItem(key, JSON.stringify(stored))
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key)
  },
}

export const dateFilterAtom = atomWithStorage<DateFilter>(
  'money-manager-date-filter',
  defaultFilter,
  storage
)

