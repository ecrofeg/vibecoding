import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetApi, type SavingsAccountCreateRequest } from '../api/budgetApi'

export function useSavingsAccounts() {
  return useQuery({
    queryKey: ['savingsAccounts'],
    queryFn: budgetApi.getSavingsAccounts,
  })
}

export function useCreateSavingsAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SavingsAccountCreateRequest) => budgetApi.createSavingsAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsAccounts'] })
    },
  })
}

export function useUpdateSavingsAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavingsAccountCreateRequest> }) =>
      budgetApi.updateSavingsAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsAccounts'] })
    },
  })
}

export function useDeleteSavingsAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => budgetApi.deleteSavingsAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsAccounts'] })
    },
  })
}
