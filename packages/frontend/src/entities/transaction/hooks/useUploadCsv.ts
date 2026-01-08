import { useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi } from '../api/transactionsApi'

export function useUploadCsv() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, file }: { cardId: string; file: File }) =>
      transactionsApi.uploadCsv(cardId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
