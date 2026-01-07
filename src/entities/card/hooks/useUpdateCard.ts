import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsApi, type CardUpdateRequest } from '../api/cardsApi'

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CardUpdateRequest }) =>
      cardsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
