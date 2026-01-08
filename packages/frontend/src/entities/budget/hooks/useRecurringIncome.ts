import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetApi, type RecurringIncomeCreateRequest } from '../api/budgetApi'
import type { RecurringIncome } from '../model/types'

export function useRecurringIncome() {
  return useQuery({
    queryKey: ['recurringIncome'],
    queryFn: async () => {
      const data = await budgetApi.getRecurringIncome()
      return data as RecurringIncome[]
    },
  })
}

export function useCreateRecurringIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RecurringIncomeCreateRequest) => budgetApi.createRecurringIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringIncome'] })
    },
  })
}

export function useUpdateRecurringIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecurringIncomeCreateRequest> }) =>
      budgetApi.updateRecurringIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringIncome'] })
    },
  })
}

export function useDeleteRecurringIncome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetApi.deleteRecurringIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringIncome'] })
    },
  })
}
