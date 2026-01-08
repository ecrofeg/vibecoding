import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetApi, type PlannedExpenseCreateRequest } from '../api/budgetApi'
import type { PlannedExpense } from '../model/types'

export function usePlannedExpenses() {
  return useQuery({
    queryKey: ['plannedExpenses'],
    queryFn: async () => {
      const data = await budgetApi.getPlannedExpenses()
      return data.map((item): PlannedExpense => ({
        ...item,
        date: new Date(item.date),
      }))
    },
  })
}

export function useCreatePlannedExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlannedExpenseCreateRequest) => budgetApi.createPlannedExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannedExpenses'] })
    },
  })
}

export function useUpdatePlannedExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PlannedExpenseCreateRequest> }) =>
      budgetApi.updatePlannedExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannedExpenses'] })
    },
  })
}

export function useDeletePlannedExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetApi.deletePlannedExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannedExpenses'] })
    },
  })
}
