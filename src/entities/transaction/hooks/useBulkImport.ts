import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi, type TransactionCreateRequest } from '../api/transactionsApi'

export function useBulkImport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransactionCreateRequest[]) => transactionsApi.bulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
