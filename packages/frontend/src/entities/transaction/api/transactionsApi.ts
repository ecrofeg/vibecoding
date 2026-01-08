import { api, endpoints } from '@/shared/api'
import type { Transaction, TransactionCategory, TransactionType } from '@/shared/types'

export type TransactionCreateRequest = {
  cardId: string
  documentId: string
  date: string
  name: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  linkedTransactionId?: string
}

export type TransactionUpdateRequest = Partial<TransactionCreateRequest>

export type TransactionsFilter = {
  startDate?: string
  endDate?: string
  cardId?: string
  category?: TransactionCategory
}

export type ApiTransaction = Omit<Transaction, 'date'> & { date: string }

export const transactionsApi = {
  getAll: (filter?: TransactionsFilter) => {
    const params = new URLSearchParams()
    if (filter?.startDate) params.append('startDate', filter.startDate)
    if (filter?.endDate) params.append('endDate', filter.endDate)
    if (filter?.cardId) params.append('cardId', filter.cardId)
    if (filter?.category) params.append('category', filter.category)

    const queryString = params.toString()
    const url = queryString ? `${endpoints.transactions}?${queryString}` : endpoints.transactions

    return api.get<ApiTransaction[]>(url)
  },

  create: (data: TransactionCreateRequest) =>
    api.post<ApiTransaction>(endpoints.transactions, data),

  bulkCreate: (data: TransactionCreateRequest[]) =>
    api.post<{ success: boolean; count: number }>(endpoints.transactionsBulk, data),

  update: (id: string, data: TransactionUpdateRequest) =>
    api.put<ApiTransaction>(endpoints.transaction(id), data),

  delete: (id: string) =>
    api.delete<{ success: boolean }>(endpoints.transaction(id)),
}
