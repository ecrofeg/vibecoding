import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi, type TransactionCreateRequest } from '../api/transactionsApi'

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransactionCreateRequest) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
