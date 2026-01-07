import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { dateFilterAtom } from '../model/dateFilterAtom'
import { transactionsApi } from '../api/transactionsApi'
import type { Transaction } from '@/shared/types'

export function useTransactions() {
  const dateFilter = useAtomValue(dateFilterAtom)

  return useQuery({
    queryKey: ['transactions', dateFilter.startDate.toISOString(), dateFilter.endDate.toISOString()],
    queryFn: async () => {
      const data = await transactionsApi.getAll({
        startDate: dateFilter.startDate.toISOString().split('T')[0],
        endDate: dateFilter.endDate.toISOString().split('T')[0],
      })
      return data.map((t): Transaction => ({
        ...t,
        date: new Date(t.date),
      }))
    },
  })
}
