import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetApi, type RecurringExpenseCreateRequest } from '../api/budgetApi'
import type { RecurringExpense } from '../model/types'

export function useRecurringExpenses() {
  return useQuery({
    queryKey: ['recurringExpenses'],
    queryFn: async () => {
      const data = await budgetApi.getRecurringExpenses()
      return data as RecurringExpense[]
    },
  })
}

export function useCreateRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RecurringExpenseCreateRequest) => budgetApi.createRecurringExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringExpenses'] })
    },
  })
}

export function useUpdateRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecurringExpenseCreateRequest> }) =>
      budgetApi.updateRecurringExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringExpenses'] })
    },
  })
}

export function useDeleteRecurringExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetApi.deleteRecurringExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringExpenses'] })
    },
  })
}
