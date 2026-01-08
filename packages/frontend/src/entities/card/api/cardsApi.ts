import { api, endpoints } from '@/shared/api'
import type { Card, CardType } from '@/shared/types'

export type CardCreateRequest = {
  name: string
  type: CardType
  color: string
}

export type CardUpdateRequest = Partial<CardCreateRequest>

export const cardsApi = {
  getAll: () => api.get<Card[]>(endpoints.cards),

  create: (data: CardCreateRequest) =>
    api.post<Card>(endpoints.cards, data),

  update: (id: string, data: CardUpdateRequest) =>
    api.put<Card>(endpoints.card(id), data),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(endpoints.card(id)),
}
