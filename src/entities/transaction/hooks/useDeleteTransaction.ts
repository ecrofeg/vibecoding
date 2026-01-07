import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactionsApi'

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
