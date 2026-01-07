import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi, type TransactionUpdateRequest } from '../api/transactionsApi'

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionUpdateRequest }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
