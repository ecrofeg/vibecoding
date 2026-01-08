import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsApi, type CardCreateRequest } from '../api/cardsApi'

export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CardCreateRequest) => cardsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}
