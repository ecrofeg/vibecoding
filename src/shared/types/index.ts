export type TransactionType = 'expense' | 'transfer' | 'refund'

export type TransactionCategory =
  | 'food_home'
  | 'food_out'
  | 'delivery'
  | 'coffee_snacks'
  | 'transport'
  | 'taxi'
  | 'shopping'
  | 'subscriptions'
  | 'health'
  | 'other'

export type Transaction = {
  id: string
  documentId: string
  date: Date
  name: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  linkedTransactionId?: string
}

export type DateFilter = {
  startDate: Date
  endDate: Date
}

