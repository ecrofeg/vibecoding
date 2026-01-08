import { useQuery } from '@tanstack/react-query'
import { cardsApi } from '../api/cardsApi'

export function useCards() {
  return useQuery({
    queryKey: ['cards'],
    queryFn: cardsApi.getAll,
  })
}
