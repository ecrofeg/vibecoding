import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsApi } from '../api/cardsApi'

export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cardsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
