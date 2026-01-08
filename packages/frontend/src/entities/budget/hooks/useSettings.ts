import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetApi } from '../api/budgetApi'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: budgetApi.getSettings,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { currentBalance: number }) => budgetApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
